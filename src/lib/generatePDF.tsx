import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import React from 'react';
import { translations, Language } from './translations';

const styles = StyleSheet.create({
  page: { padding: 50, backgroundColor: '#ffffff' },
  header: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#0f172a' },
  subheader: { fontSize: 10, color: '#64748b', marginBottom: 28 },
  h1: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 18, marginBottom: 6 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 14, marginBottom: 5 },
  h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 10, marginBottom: 4 },
  paragraph: { fontSize: 10.5, color: '#334155', lineHeight: 1.65, marginBottom: 6 },
  bullet: { fontSize: 10.5, color: '#334155', lineHeight: 1.65, marginBottom: 3, paddingLeft: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 10 },
});

// Blocco di testo con supporto bold inline
const InlineText = ({ text, style }: { text: string; style: any }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>{part}</Text>
          : part
      )}
    </Text>
  );
};

const PDFDocument = ({ lines, t, title }: { lines: { type: string; content: string }[], t: any, title: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subheader}>
        {t.generatedBy} — {new Date().toLocaleDateString()}
      </Text>
      <View style={styles.divider} />

      {lines.map((line, i) => {
        if (line.type === 'h1') return <Text key={i} style={styles.h1}>{line.content}</Text>;
        if (line.type === 'h2') return <Text key={i} style={styles.h2}>{line.content}</Text>;
        if (line.type === 'h3') return <Text key={i} style={styles.h3}>{line.content}</Text>;
        if (line.type === 'bullet') return <InlineText key={i} text={`• ${line.content}`} style={styles.bullet} />;
        if (line.type === 'paragraph') return <InlineText key={i} text={line.content} style={styles.paragraph} />;
        return null;
      })}
    </Page>
  </Document>
);

function parseMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  const result: { type: string; content: string }[] = [];

  for (const raw of lines) {
    const line = raw
      // Rimuovi emoji e caratteri non-latin
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[\uFE00-\uFE0F]/g, '')
      .trim();

    if (!line) continue;

    if (line.startsWith('### ')) result.push({ type: 'h3', content: line.slice(4).trim() });
    else if (line.startsWith('## ')) result.push({ type: 'h2', content: line.slice(3).trim() });
    else if (line.startsWith('# ')) result.push({ type: 'h1', content: line.slice(2).trim() });
    else if (/^[-*]\s+/.test(line)) result.push({ type: 'bullet', content: line.replace(/^[-*]\s+/, '') });
    else if (/^\[.\]\s+/.test(line)) result.push({ type: 'bullet', content: line.replace(/^\[.\]\s+/, '') });
    else result.push({ type: 'paragraph', content: line });
  }

  return result;
}

export async function generatePDF(markdownText: string, lang: Language = 'en', title: string) {
  const lines = parseMarkdown(markdownText);
  const t = translations[lang].pdf;
  const blob = await pdf(<PDFDocument lines={lines} t={t} title={title} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Riassunto_SmartSum.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
