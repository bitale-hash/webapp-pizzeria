import React from 'react';
import AdminAssistant from '../../components/admin/AdminAssistant';
import styles from './page.module.css';

export default function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.div}>
      {children}
      <AdminAssistant />
    </div>
  );
}