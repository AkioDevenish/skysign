import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1917', // stone-900 equivalent
  },
  subtitle: {
    fontSize: 10,
    color: '#78716c', // stone-500
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: '#78716c',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#1c1917',
    flex: 1,
  },
  signatureBox: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#FAFAF9', // stone-50
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    height: 80,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#a8a29e',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 10,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5', // emerald-50
    padding: '4 8',
    borderRadius: 4,
  },
  statusText: {
    color: '#059669', // emerald-600
    fontSize: 10,
    fontWeight: 'bold',
  },
});

interface AuditProps {
  signatureId: string;
  timestamp: string;
  signerName: string;
  signerEmail?: string; // Optional for now if not tracked
  ipAddress?: string;
  userAgent?: string;
  signatureImage?: string; // Base64 or URL
  documentTitle?: string;
}

export const AuditCertificate = ({
  signatureId,
  timestamp,
  signerName,
  signerEmail = 'Authenticated User',
  ipAddress = '127.0.0.1 (Masked)',
  userAgent,
  signatureImage,
  documentTitle = 'Signed Document',
}: AuditProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Audit Trail Certificate</Text>
          <Text style={styles.subtitle}>SkySign Secure Transaction</Text>
        </View>
        <View style={styles.statusBadge}>
            <Text style={styles.statusText}>SIGNED & VERIFIED</Text>
        </View>
      </View>

      {/* Document Details */}
      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#1c1917' }}>Document Details</Text>
        
        <View style={styles.row}>
            <Text style={styles.label}>Document Name:</Text>
            <Text style={styles.value}>{documentTitle}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Transaction ID:</Text>
            <Text style={styles.value}>{signatureId}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Timestamp (UTC):</Text>
            <Text style={styles.value}>{timestamp}</Text>
        </View>
      </View>

      {/* Signer Details */}
      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#1c1917' }}>Signer Identity</Text>
        
        <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{signerName}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Email/ID:</Text>
            <Text style={styles.value}>{signerEmail}</Text>
        </View>
         <View style={styles.row}>
            <Text style={styles.label}>IP Address:</Text>
            <Text style={styles.value}>{ipAddress}</Text>
        </View>
         <View style={styles.row}>
            <Text style={styles.label}>Device:</Text>
            <Text style={styles.value}>{userAgent || 'Unknown'}</Text>
        </View>
      </View>

      {/* Visual Signature */}
      <View style={styles.section}>
         <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#1c1917' }}>Signature</Text>
         <View style={styles.signatureBox}>
            {signatureImage ? (
                 <Image src={signatureImage} style={styles.signatureImage} />
            ) : (
                <Text style={{color: '#a8a29e'}}>Signature Image Not Available</Text>
            )}
         </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Powered by SkySign | Secure E-Signature Platform</Text>
        <Text style={{marginTop: 4}}>Doc ID: {signatureId} | Generated: {new Date().toISOString()}</Text>
      </View>
    </Page>
  </Document>
);
