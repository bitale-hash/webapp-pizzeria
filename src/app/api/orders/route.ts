//api/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const ordersFromDb = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        items: {
          include: { 
            product: {
              include: {
                category: {
                  include: {
                    productionDepartment: true
                  }
                }
              }
            }
          }
        } 
      }
    });

    const orders = ordersFromDb.map(order => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      items: order.items.map((i: any) => {
        const productName = i.product?.name || 'Prodotto';
        const departmentId = i.product?.category?.departmentId || i.product?.departmentId || null;
        const categoryId = i.categoryId || i.product?.categoryId || null;
        
        const cleanedExtras = i.selectedExtras 
          ? i.selectedExtras.replace(/⚠️/g, '').replace(/,\s*,/g, ',').trim() 
          : '';
        const extras = cleanedExtras ? ` (Extra: ${cleanedExtras})` : '';
        const notes = i.notes ? ` [Note: ${i.notes}]` : '';

        const extraIds = i.selectedExtrasIds 
          ? i.selectedExtrasIds.split(',').map((idStr: string) => Number(idStr.trim())).filter(Boolean)
          : [];
        
        return {
          id: i.id,
          productId: i.productId,
          categoryId: categoryId,
          departmentId: departmentId,
          quantity: i.quantity,
          name: productName,
          extras: cleanedExtras,
          extrasIds: extraIds,
          notes: i.notes,
          formatted: `${i.quantity}x ${productName}${extras}${notes}`
        };
      }),
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('❌ ERRORE GET /api/orders:', error.message || error);
    return NextResponse.json({ success: false, error: 'Impossibile caricare gli ordini' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      customerName, 
      totalPrice, 
      pickupTime, 
      status = 'pending', 
      items, 
      orderType,         
      tableNumber,       
      deliveryAddress,
      covers             
    } = body;

    const processedItems = await Promise.all((items || []).map(async (item: any) => {
      let catId = item.categoryId ? Number(item.categoryId) : (item.category_id ? Number(item.category_id) : null);

      if (!catId && item.productId) {
        const productFromDb = await prisma.product.findUnique({
          where: { id: Number(item.productId) },
          select: { categoryId: true }
        });
        if (productFromDb) {
          catId = productFromDb.categoryId;
        }
      }

      const extraNames = (item.extras || [])
        .map((e: any) => {
          const name = typeof e === 'object' ? e.name : e;
          return name ? name.replace(/⚠️/g, '').trim() : '';
        })
        .filter(Boolean)
        .join(', ') || (item.selectedIngredients ? item.selectedIngredients.map((i: string) => i.replace(/⚠️/g, '').trim()).join(', ') : null);

      const extraIds = (item.extras || [])
        .map((e: any) => (typeof e === 'object' && (e.id || e.ingredientId) ? Number(e.id || e.ingredientId) : null))
        .filter(Boolean)
        .join(', ');

      const unitPrice = Number(item.price) || (Number(totalPrice) / (item.quantity || 1));

      return {
        productId: item.productId ? Number(item.productId) : null,
        categoryId: catId ? Number(catId) : null,
        quantity: Number(item.quantity) || 1,
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        selectedExtras: extraNames || null,
        selectedExtrasIds: extraIds || null,
        notes: item.notes || null
      };
    }));

    // 🚀 1. Recupera la configurazione dinamica dei costi e dei tavoli dal database
    const settingsRecord = await prisma.setting.findUnique({
      where: { key: 'order_types_config' }
    });

    const orderConfig = settingsRecord ? JSON.parse(settingsRecord.value) : {
      tableServiceFee: 1.50,
      deliveryFee: 2.50,
      minDeliveryOrder: 15.00,
      totalTables: 20
    };

    // Calcola il subtotale dei prodotti nel carrello
    const itemsSubtotal = processedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    let finalTotalPrice = itemsSubtotal;
    let validatedCovers = null;

    const resolvedOrderType = orderType || 'counter';

    // 🚀 2. Applica le logiche e i controlli in base al tipo di ordine
    if (resolvedOrderType === 'table') {
      const tableNum = tableNumber ? Number(tableNumber) : null;
      const maxTables = Number(orderConfig.totalTables) || 20;

      if (!tableNum || tableNum <= 0) {
        return NextResponse.json({ success: false, error: 'Numero di tavolo non valido.' }, { status: 400 });
      }

      // Controllo esistenza tavolo rispetto al totale configurato
      if (tableNum > maxTables) {
        return NextResponse.json({ 
          success: false, 
          error: `Il tavolo n. ${tableNum} non esiste. (Il locale ha ${maxTables} tavoli totali).` 
        }, { status: 400 });
      }

      validatedCovers = covers ? Number(covers) : 1;
      const tableFee = Number(orderConfig.tableServiceFee) || 0;
      finalTotalPrice += tableFee * validatedCovers;

    } else if (resolvedOrderType === 'delivery') {
      if (!deliveryAddress || deliveryAddress.trim() === '') {
        return NextResponse.json({ success: false, error: 'L\'indirizzo di consegna è obbligatorio.' }, { status: 400 });
      }

      const deliveryFee = Number(orderConfig.deliveryFee) || 0;
      const minDeliveryOrder = Number(orderConfig.minDeliveryOrder) || 0;

      // Controllo spesa minima per la consegna
      if (itemsSubtotal < minDeliveryOrder) {
        return NextResponse.json({ 
          success: false, 
          error: `Spesa minima non raggiunta. Il minimo per la consegna è € ${minDeliveryOrder.toFixed(2)}` 
        }, { status: 400 });
      }

      finalTotalPrice += deliveryFee;
    }

    // 🚀 3. Crea l'ordine nel database con il totale aggiornato e i coperti
    const newOrder = await prisma.order.create({
      data: {
        id: String(id),
        customerName,
        totalPrice: Number(finalTotalPrice.toFixed(2)),
        status,
        pickupTime: String(pickupTime),
        orderType: resolvedOrderType,
        tableNumber: tableNumber ? Number(tableNumber) : null,
        deliveryAddress: deliveryAddress || null,
        covers: validatedCovers,
        items: {
          create: processedItems
        }
      },
      include: { 
        items: {
          include: { 
            product: {
              include: { category: true }
            } 
          }
        } 
      }
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('❌ ERRORE POST /api/orders:', error.message || error);
    return NextResponse.json({ success: false, error: error.message || 'Impossibile salvare l\'ordine' }, { status: 500 });
  }
}