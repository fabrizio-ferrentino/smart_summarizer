import { Document, Page, Text, View, Link, StyleSheet, pdf } from '@react-pdf/renderer';
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
  link: { color: '#2563eb', textDecoration: 'underline' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 10 },
  // Quotes (blockquote)
  quote: {
    fontSize: 10.5, color: '#475569', lineHeight: 1.6, marginVertical: 6,
    paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#cbd5e1',
  },
  // Tables
  table: { marginTop: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableCell: { flex: 1, padding: 6 },
  tableCellBorder: { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' },
  tableHeader: { backgroundColor: '#f1f5f9' },
  tableHeaderText: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  tableCellText: { fontSize: 9.5, color: '#334155' },
});

// Text with inline bold (**...**) and clickable links ([text](url))
const RichText = ({ text, style }: { text: string; style?: any }) => {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <Text style={style}>
      {tokens.map((tok, i) => {
        if (!tok) return null;
        const bold = /^\*\*([^*]+)\*\*$/.exec(tok);
        if (bold) return <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>{bold[1]}</Text>;
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
        if (link) return <Link key={i} src={link[2]} style={styles.link}>{link[1]}</Link>;
        return <Text key={i}>{tok}</Text>;
      })}
    </Text>
  );
};

type Block =
  | { type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'numbered' | 'quote'; content: string }
  | { type: 'table'; header: string[]; rows: string[][] };

const PDFDocument = ({ blocks, t, title }: { blocks: Block[], t: any, title: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subheader}>
        {t.generatedBy} — {new Date().toLocaleDateString()}
      </Text>
      <View style={styles.divider} />

      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h1': return <Text key={i} style={styles.h1}>{block.content}</Text>;
          case 'h2': return <Text key={i} style={styles.h2}>{block.content}</Text>;
          case 'h3': return <Text key={i} style={styles.h3}>{block.content}</Text>;
          case 'quote': return <RichText key={i} text={block.content} style={styles.quote} />;
          case 'bullet': return <RichText key={i} text={`•  ${block.content}`} style={styles.bullet} />;
          case 'numbered': return <RichText key={i} text={block.content} style={styles.bullet} />;
          case 'paragraph': return <RichText key={i} text={block.content} style={styles.paragraph} />;
          case 'table':
            return (
              <View key={i} style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {block.header.map((cell, ci) => (
                    <View key={ci} style={ci > 0 ? [styles.tableCell, styles.tableCellBorder] : styles.tableCell}>
                      <RichText text={cell} style={styles.tableHeaderText} />
                    </View>
                  ))}
                </View>
                {block.rows.map((row, ri) => (
                  <View key={ri} style={styles.tableRow}>
                    {row.map((cell, ci) => (
                      <View key={ci} style={ci > 0 ? [styles.tableCell, styles.tableCellBorder] : styles.tableCell}>
                        <RichText text={cell} style={styles.tableCellText} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          default: return null;
        }
      })}
    </Page>
  </Document>
);

/**
 * Builds a clean filename from the report title.
 * Normalize accents, use hyphens as separators, append the date.
 * Ex: "Company Meeting" -> "company-meeting-2026-05-31.pdf"
 */
function buildFilename(title: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slug = (title || '')
    .normalize('NFD')                  // separate letters and accents
    .replace(/[̀-ͯ]/g, '')   // remove diacritics (à -> a)
    .replace(/[^a-zA-Z0-9]+/g, '-')    // each group of invalid characters -> a hyphen
    .replace(/^-+|-+$/g, '')           // remove the hyphens at the beginning and end
    .toLowerCase()
    .slice(0, 60);                     // limit the length
  return `${slug || 'summary'}-${date}.pdf`;
}

// Removes emoji and symbol characters not handled by standard PDF fonts
function cleanLine(raw: string): string {
  return raw
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[☀-➿]/g, '')
    .replace(/[︀-️]/g, '');
}

const isTableRow = (line: string) => /^\|.*\|$/.test(line.trim());
const isTableSeparator = (line: string) => {
  const l = line.trim();
  return /^\|?[\s:|-]+\|?$/.test(l) && l.includes('-') && l.includes('|');
};
const parseRow = (line: string) =>
  line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

function parseMarkdown(markdown: string): Block[] {
  const raw = markdown.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < raw.length) {
    const line = cleanLine(raw[i]).trim();
    if (!line) { i++; continue; }

    // Table: current row + following separator row (|---|---|)
    if (isTableRow(line) && i + 1 < raw.length && isTableSeparator(cleanLine(raw[i + 1]))) {
      const header = parseRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < raw.length && isTableRow(cleanLine(raw[i]).trim())) {
        rows.push(parseRow(cleanLine(raw[i]).trim()));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    if (line.startsWith('### ')) blocks.push({ type: 'h3', content: line.slice(4).trim() });
    else if (line.startsWith('## ')) blocks.push({ type: 'h2', content: line.slice(3).trim() });
    else if (line.startsWith('# ')) blocks.push({ type: 'h1', content: line.slice(2).trim() });
    else if (line.startsWith('> ')) blocks.push({ type: 'quote', content: line.slice(2).trim() });
    else if (/^[-*]\s+\[.\]\s+/.test(line)) blocks.push({ type: 'bullet', content: line.replace(/^[-*]\s+\[(.)\]\s+/, '[$1] ') });
    else if (/^\[.\]\s+/.test(line)) blocks.push({ type: 'bullet', content: line });
    else if (/^[-*]\s+/.test(line)) blocks.push({ type: 'bullet', content: line.replace(/^[-*]\s+/, '') });
    else if (/^\d+\.\s+/.test(line)) blocks.push({ type: 'numbered', content: line });
    else blocks.push({ type: 'paragraph', content: line });
    i++;
  }

  return blocks;
}

export async function generatePDF(markdownText: string, lang: Language = 'en', title: string) {
  const blocks = parseMarkdown(markdownText);
  const t = translations[lang].pdf;
  const blob = await pdf(<PDFDocument blocks={blocks} t={t} title={title} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildFilename(title);
  a.click();
  URL.revokeObjectURL(url);
}
