import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const restaurantInfo = await prisma.restaurantInfo.findFirst();
    return NextResponse.json(restaurantInfo || {});
  } catch (error) {
    console.error('Errore GET /api/general:', error);
    return NextResponse.json({ error: 'Errore nel caricamento dei dati' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const restaurantName = formData.get('restaurantName') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const description = formData.get('description') as string;
    const facebook = formData.get('facebook') as string;
    const instagram = formData.get('instagram') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const bookingTitle = formData.get('bookingTitle') as string;
    const bookingDescription = formData.get('bookingDescription') as string;

    const presentationImageFile = formData.get('presentationImage') as File | null;
    const bookingBgImageFile = formData.get('bookingBgImage') as File | null;
    const footerLogoFile = formData.get('footerLogo') as File | null;

    // Recuperiamo il record esistente per preservare le immagini vecchie se non ne vengono caricate di nuove
    const existingInfo = await prisma.restaurantInfo.findFirst();

    let presentationImageUrl = existingInfo?.presentationImage || '';
    let bookingBgImageUrl = existingInfo?.bookingBgImage || '';
    let footerLogoUrl = existingInfo?.footerLogo || '';

    // 1. Salvataggio immagine di presentazione
    if (presentationImageFile && presentationImageFile.size > 0) {
      const bytes = await presentationImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '-' + presentationImageFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

      await writeFile(uploadPath, buffer);
      presentationImageUrl = `/uploads/${filename}`;
    }

    // 2. Salvataggio immagine sfondo prenotazioni
    if (bookingBgImageFile && bookingBgImageFile.size > 0) {
      const bytes = await bookingBgImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '-' + bookingBgImageFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

      await writeFile(uploadPath, buffer);
      bookingBgImageUrl = `/uploads/${filename}`;
    }

    // 3. Salvataggio logo footer
    if (footerLogoFile && footerLogoFile.size > 0) {
      const bytes = await footerLogoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '-' + footerLogoFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

      await writeFile(uploadPath, buffer);
      footerLogoUrl = `/uploads/${filename}`;
    }

    const infoPayload = {
      restaurantName: restaurantName || '',
      address: address || '',
      phone: phone || '',
      email: email || '',
      title: title || '',
      subtitle: subtitle || '',
      description: description || '',
      presentationImage: presentationImageUrl,
      bookingTitle: bookingTitle || '',
      bookingDescription: bookingDescription || '',
      bookingBgImage: bookingBgImageUrl,
      footerLogo: footerLogoUrl,
      facebook: facebook || '',
      instagram: instagram || '',
      whatsapp: whatsapp || '',
    };

    if (existingInfo) {
      await prisma.restaurantInfo.update({
        where: { id: existingInfo.id },
        data: infoPayload,
      });
    } else {
      await prisma.restaurantInfo.create({
        data: infoPayload,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore dettagliato POST /api/general:', error.message || error);
    return NextResponse.json({ error: error.message || 'Errore nel salvataggio dei dati' }, { status: 500 });
  }
}