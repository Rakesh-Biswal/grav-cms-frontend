// components/sales/QuotationPDFGenerator.js - USING @react-pdf/renderer
"use client";

import { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  PDFDownloadLink
} from '@react-pdf/renderer';
import { Download } from "lucide-react"

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu51xIIzc.ttf',
      fontStyle: 'italic',
    },
  ],
});

// Create styles - Formal and clean
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.4,
    position: 'relative',
  },
  container: {
    flex: 1,
    paddingBottom: 30, // Space for page number
  },

  // Header styles - Formal
  headerContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    borderBottomStyle: 'solid',
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  companyLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 50,
    height: 50,
    marginRight: 12,
    objectFit: 'contain',
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    color: '#111',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyTagline: {
    color: '#666',
    fontSize: 9,
  },
  quotationBadge: {
    padding: '8 12',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666',
    borderStyle: 'solid',
  },
  quotationTitle: {
    color: '#222',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quotationNumber: {
    color: '#555',
    fontSize: 10,
  },
  headerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#666',
    marginTop: 5,
  },

  // Customer details
  customerContainer: {
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  detailBox: {
    flex: 1,
  },
  detailTitle: {
    color: '#222',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
  },
  detailContent: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    fontSize: 10,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
    fontSize: 11,
  },
  customerText: {
    color: '#555',
    marginVertical: 3,
    fontSize: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  detailLabel: {
    color: '#666',
    fontSize: 9,
  },
  detailValue: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 9,
  },

  // Opening message
  openingMessage: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'solid',
  },
  openingText: {
    fontSize: 10,
    color: '#555',
  },
  openingGreeting: {
    fontSize: 10,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  // Table styles - Formal
  tableTitle: {
    color: '#222',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    borderRightStyle: 'solid',
  },
  tableCellCenter: {
    textAlign: 'center',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    borderRightStyle: 'solid',
  },
  tableCellRight: {
    textAlign: 'right',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    borderRightStyle: 'solid',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#333',
  },
  srNoCell: {
    width: '6%',
  },
  descCell: {
    width: '44%',
  },
  hsnCell: {
    width: '10%',
  },
  qtyCell: {
    width: '8%',
  },
  priceCell: {
    width: '12%',
  },
  totalCell: {
    width: '20%',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#111',
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 8,
    color: '#666',
    marginBottom: 1,
  },
  itemDescription: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 1,
  },
  variantDetails: {
    fontSize: 8,
    color: '#555',
    marginTop: 2,
  },
  subAmount: {
    fontSize: 7,
    color: '#777',
    marginTop: 2,
  },

  // Summary styles - Formal
  summaryTitle: {
    color: '#222',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
  },
  summaryContainer: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  summaryLabel: {
    color: '#555',
    fontSize: 10,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 10,
  },
  discountValue: {
    fontWeight: 'bold',
    color: '#c00',
    fontSize: 10,
  },
  taxValue: {
    fontWeight: 'bold',
    color: '#090',
    fontSize: 10,
  },

  // Product Amount Breakdown - Formal
  productBreakdown: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    marginBottom: 10,
  },
  breakdownTitle: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    color: '#666',
    fontSize: 10,
  },
  breakdownValue: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 10,
  },

  // Grand Total - Formal (no blue box)
  grandTotalContainer: {
    padding: 12,
    borderRadius: 4,
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'solid',
    backgroundColor: '#f9f9f9',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 13,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 16,
  },

  // Payment Terms
  paymentContainer: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    marginBottom: 15,
  },
  paymentItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'solid',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentName: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 10,
  },
  paymentAmount: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 10,
  },
  paymentDate: {
    color: '#777',
    fontSize: 9,
  },

  // Terms
  termsContainer: {
    marginBottom: 20,
  },
  termsContent: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    fontSize: 9,
    color: '#555',
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    marginTop: 25,
    paddingTop: 15,
    fontSize: 9,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderTopStyle: 'solid',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  signatureSection: {
    width: '60%',
  },
  signatureContainer: {
    marginTop: 15,
    paddingTop: 10,
  },
  // Add or update this in your styles section
  signatureImage: {
    width: 150,  // Increased width
    height: 100,   // Increased height
    marginBottom: 8,
    objectFit: 'contain',
  },
  signaturePlaceholder: {
    width: 160,   // Increased width
    height: 80,    // Increased height
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderBottomStyle: 'solid',
    marginTop: 5,
  },
  signatureLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#222',
    marginBottom: 2,
  },
  signatureSubLabel: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  signatureLine: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderBottomStyle: 'solid',
    marginTop: 20,
  },

  footerDivider: {
    paddingTop: 8,
    marginTop: 15,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderTopStyle: 'solid',
  },
  footerText: {
    marginBottom: 3,
    fontSize: 8,
    color: '#777',
  },

  // Continuation header
  continuationHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  continuationTitle: {
    color: '#222',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  continuationSubtitle: {
    color: '#666',
    fontSize: 9,
  },

  // Page info
  pageInfo: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

// Helper functions
const formatIndianRupees = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
    return 'Rs. 0.00';
  }

  const numAmount =
    typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]+/g, ''))
      : Number(amount);

  // Indian number formatting (no currency symbol)
  const parts = numAmount.toFixed(2).split('.');
  let integer = parts[0];
  const decimal = parts[1];

  let lastThree = integer.slice(-3);
  let otherNumbers = integer.slice(0, -3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }

  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `Rs. ${formatted}.${decimal}`;
};



const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num) || num === '') return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return 'N/A';
  }
};

const getValue = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    return defaultValue;
  }
  return typeof value === 'string' ? parseFloat(value) : value;
};

// Component for header
const PDFHeader = ({ quotation, request, companyLogo }) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerRow}>
      <View style={styles.companyLogoContainer}>
        {companyLogo ? (
          <Image
            src={companyLogo}
            style={styles.companyLogo}
          />
        ) : (
          <View style={{
            width: 50,
            height: 50,
            borderWidth: 1,
            borderColor: '#333',
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 14 }}>GC</Text>
          </View>
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>GRAV CLOTHING</Text>
        </View>
      </View>
      <View style={styles.quotationBadge}>
        <Text style={styles.quotationTitle}>QUOTATION</Text>
        <Text style={styles.quotationNumber}>
          <Text style={{ fontWeight: 'bold' }}>No: </Text>{quotation.quotationNumber || 'N/A'}
        </Text>
      </View>
    </View>
    <View style={styles.headerDetails}>
      <View>
        <Text>123 Jayadev Vihar, Bhubaneswar, Odisha - 751021</Text>
        <Text>GSTIN: 27AABCU9603R1ZM | Phone: +91 22 1234 5678</Text>
      </View>
      <View style={{ textAlign: 'right' }}>
        <Text><Text style={{ fontWeight: 'bold' }}>Date:</Text> {formatDate(quotation.date)}</Text>
        <Text><Text style={{ fontWeight: 'bold' }}>Valid Until:</Text> {formatDate(quotation.validUntil)}</Text>
      </View>
    </View>
  </View>
);

// Component for customer details
const PDFCustomerDetails = ({ quotation, request }) => (
  <View style={styles.customerContainer}>
    <View style={styles.detailsRow}>
      <View style={styles.detailBox}>
        <Text style={styles.detailTitle}>BILL TO</Text>
        <View style={styles.detailContent}>
          <Text style={styles.customerName}>{request.customerInfo?.name || 'Customer Name'}</Text>
          <Text style={styles.customerText}>{request.customerInfo?.address || 'Address not specified'}</Text>
          <Text style={styles.customerText}>
            {request.customerInfo?.city || ''}
            {request.customerInfo?.state ? `, ${request.customerInfo.state}` : ''}
            {request.customerInfo?.postalCode ? ` - ${request.customerInfo.postalCode}` : ''}
          </Text>
          <Text style={styles.customerText}>Phone: {request.customerInfo?.phone || 'N/A'}</Text>
          <Text style={styles.customerText}>Email: {request.customerInfo?.email || 'N/A'}</Text>
          {request.customerInfo?.gstin && (
            <Text style={styles.customerText}>GSTIN: {request.customerInfo.gstin}</Text>
          )}
        </View>
      </View>
      <View style={styles.detailBox}>
        <Text style={styles.detailTitle}>QUOTATION DETAILS</Text>
        <View style={styles.detailContent}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Request ID:</Text>
            <Text style={styles.detailValue}>{request.requestId || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{quotation.status || 'DRAFT'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Prepared By:</Text>
            <Text style={styles.detailValue}>{quotation.preparedBy || 'Sales Team'}</Text>
          </View>
          {quotation.paymentTerms && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Terms:</Text>
              <Text style={styles.detailValue}>{quotation.paymentTerms}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  </View>
);

// Component for opening message
const PDFOpeningMessage = ({ request }) => (
  <View style={styles.openingMessage}>
    <Text style={styles.openingGreeting}>
      Dear {request.customerInfo?.name?.split(' ')[0] || 'Valued Customer'},
    </Text>
    <Text style={styles.openingText}>
      Thank you for your inquiry. We are pleased to submit our quotation as requested.
    </Text>
  </View>
);

// Component for items table - Formal design
const PDFItemsTable = ({ items, startIndex = 0, itemsPerPage = 12, pageNumber = 1, totalItems = 0 }) => {
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);
  const pageItems = items.slice(startIndex, endIndex);

  return (
    <View wrap={false}>
      <Text style={styles.tableTitle}>
        QUOTATION ITEMS {pageNumber > 1 ? `(Page ${pageNumber})` : ''}
      </Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={[styles.tableCellCenter, styles.srNoCell]}>
            <Text style={styles.tableHeaderCell}>#</Text>
          </View>
          <View style={[styles.tableCell, styles.descCell]}>
            <Text style={styles.tableHeaderCell}>PRODUCT DESCRIPTION</Text>
          </View>
          <View style={[styles.tableCellCenter, styles.hsnCell]}>
            <Text style={styles.tableHeaderCell}>HSN</Text>
          </View>
          <View style={[styles.tableCellCenter, styles.qtyCell]}>
            <Text style={styles.tableHeaderCell}>QTY</Text>
          </View>
          <View style={[styles.tableCellRight, styles.priceCell]}>
            <Text style={styles.tableHeaderCell}>UNIT PRICE</Text>
          </View>
          <View style={[styles.tableCellRight, styles.totalCell]}>
            <Text style={styles.tableHeaderCell}>TOTAL</Text>
          </View>
        </View>

        {/* Table Rows */}
        {pageItems.map((item, index) => {
          const attributes = item.attributes || [];
          const variantDetails = attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');

          const priceBeforeGST = getValue(item.priceBeforeGST, 0);
          const gstAmount = getValue(item.gstAmount, 0);
          const priceIncludingGST = getValue(item.priceIncludingGST, 0);

          return (
            <View key={index} style={[
              styles.tableRow,
              {
                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
              }
            ]}>
              <View style={[styles.tableCellCenter, styles.srNoCell]}>
                <Text style={{ fontWeight: 'bold', fontSize: 9 }}>{startIndex + index + 1}</Text>
              </View>
              <View style={[styles.tableCell, styles.descCell]}>
                <Text style={styles.itemName}>{item.itemName || 'Product Item'}</Text>
                {item.itemCode && (
                  <Text style={styles.itemCode}>Code: {item.itemCode}</Text>
                )}
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
                {variantDetails && (
                  <Text style={styles.variantDetails}>{variantDetails}</Text>
                )}
              </View>
              <View style={[styles.tableCellCenter, styles.hsnCell]}>
                <Text style={{ color: '#666', fontSize: 9 }}>{item.hsnCode || 'N/A'}</Text>
              </View>
              <View style={[styles.tableCellCenter, styles.qtyCell]}>
                <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{formatNumber(item.quantity)}</Text>
                {item.unit && (
                  <Text style={{ fontSize: 8, color: '#777' }}>{item.unit}</Text>
                )}
              </View>
              <View style={[styles.tableCellRight, styles.priceCell]}>
                <Text style={{ fontSize: 10 }}>{item.unitPrice}</Text>
              </View>
              <View style={[styles.tableCellRight, styles.totalCell]}>
                <Text style={{ fontWeight: 'bold', color: '#111', fontSize: 11 }}>
                  {priceIncludingGST}
                </Text>
                <Text style={styles.subAmount}>
                  Product: {priceBeforeGST}
                </Text>
                <Text style={styles.subAmount}>
                  GST: {gstAmount}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {pageNumber > 1 && (
        <Text style={{ textAlign: 'center', color: '#777', fontSize: 8, marginTop: 8 }}>
          Items {startIndex + 1} to {endIndex} of {totalItems}
        </Text>
      )}
    </View>
  );
};

// Component for price summary
// Component for price summary - FIXED VERSION
const PDFPriceSummary = ({ quotation }) => {
  const subtotalBeforeGST = getValue(quotation.subtotalBeforeGST, 0);
  const totalDiscount = getValue(quotation.totalDiscount, 0);
  const totalGST = getValue(quotation.totalGST, 0);
  const grandTotal = getValue(quotation.grandTotal, 0);
  const taxableAmount = subtotalBeforeGST - totalDiscount;

  // Calculate total additional charges
  const totalAdditionalCharges = (quotation.customAdditionalCharges || []).reduce((sum, charge) => {
    return sum + getValue(charge.amount, 0);
  }, 0);

  return (
    <View wrap={false}>
      <Text style={styles.summaryTitle}>PRICE SUMMARY</Text>

      {/* Product Amount Breakdown */}
      <View style={styles.productBreakdown}>
        <Text style={styles.breakdownTitle}>AMOUNT BREAKDOWN</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Product Value:</Text>
          <Text style={styles.breakdownValue}>{formatIndianRupees(subtotalBeforeGST)}</Text>
        </View>

        {totalDiscount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Discount:</Text>
            <Text style={[styles.breakdownValue, { color: '#c00' }]}>- {formatIndianRupees(totalDiscount)}</Text>
          </View>
        )}

        <View style={[styles.breakdownRow, {
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: '#ddd'
        }]}>
          <Text style={[styles.breakdownLabel, { fontWeight: 'bold' }]}>Taxable Amount:</Text>
          <Text style={[styles.breakdownValue, { fontWeight: 'bold' }]}>{formatIndianRupees(taxableAmount)}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total GST Amount:</Text>
          <Text style={[styles.breakdownValue, { color: '#090' }]}>{formatIndianRupees(totalGST)}</Text>
        </View>

        {/* Additional Charges - FIXED: using map instead of forEach */}
        {(quotation.customAdditionalCharges || []).length > 0 && (
          <>
            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' }}>
              <Text style={{ color: '#555', fontSize: 10, marginBottom: 6, fontWeight: 'bold' }}>
                ADDITIONAL CHARGES
              </Text>
              {(quotation.customAdditionalCharges || []).map((charge, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{charge.name}:</Text>
                  <Text style={styles.breakdownValue}>{charge.amount || 0}</Text>
                </View>
              ))}
              {/* Total Additional Charges */}
              <View style={[styles.breakdownRow, {
                paddingTop: 6,
                borderTopWidth: 1,
                borderTopColor: '#ddd',
                marginTop: 4
              }]}>
                <Text style={[styles.breakdownLabel, { fontWeight: 'bold' }]}>Total Additional Charges:</Text>
                <Text style={[styles.breakdownValue, { fontWeight: 'bold' }]}>{formatIndianRupees(totalAdditionalCharges)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Shipping Charges if present */}
        {quotation.shippingCharges > 0 && (
          <View style={[styles.breakdownRow, { marginTop: 8 }]}>
            <Text style={styles.breakdownLabel}>Shipping Charges:</Text>
            <Text style={styles.breakdownValue}>{formatIndianRupees(quotation.shippingCharges)}</Text>
          </View>
        )}
      </View>

      {/* Grand Total - Formal */}
      <View style={styles.grandTotalContainer}>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
          <Text style={styles.grandTotalValue}>{formatIndianRupees(grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

// Component for terms and conditions
const PDFTermsAndConditions = ({ quotation }) => (
  <View style={[styles.termsContainer, { marginTop: 20 }]}>
    <Text style={styles.summaryTitle}>TERMS AND CONDITIONS</Text>
    <View style={styles.termsContent}>
      <Text style={{ color: '#555', lineHeight: 1.5 }}>
        {quotation.termsAndConditions ? (
          quotation.termsAndConditions.split('\n').map((line, i) => (
            <Text key={i}>
              {line}
              {i < quotation.termsAndConditions.split('\n').length - 1 && '\n'}
            </Text>
          ))
        ) : (
          `1. This quotation is valid for 30 days from the date mentioned.\n` +
          `2. Prices are inclusive of all taxes.\n` +
          `3. Payment terms: 50% advance, balance before delivery.\n` +
          `4. Delivery schedule commences after receipt of advance payment.\n` +
          `5. Orders once placed cannot be cancelled.\n` +
          `6. Colors and shades may slightly vary from samples.\n` +
          `7. Minimum order quantity applies.\n` +
          `8. All disputes subject to Bhubaneswar jurisdiction.`
        )}
      </Text>
    </View>
  </View>
);


// Component for footer with signatures
const PDFFooter = ({ pageNumber, totalPages, customerSignature }) => (
  <View style={styles.footer} wrap={false}>
    <View style={styles.footerRow}>
      {/* Left side - Customer Acceptance (Blank for manual signature) */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureContainer}>
          {/* Simple blank space for manual signature - No highlighting */}
          <View style={{ height: 80, marginBottom: 10, justifyContent: 'flex-end' }}>
            <View style={styles.signatureLine} />
          </View>
          <Text style={styles.signatureLabel}>CUSTOMER ACCEPTANCE</Text>
          <Text style={styles.signatureSubLabel}>Signature with Company Stamp</Text>

        </View>
      </View>

      {/* Right side - Authorized Signatory (with image functionality) */}
      {/* Right side - Authorized Signatory (RIGHT ALIGNED) */}
      <View style={[styles.signatureSection, { alignItems: 'flex-end' }]}>
        <View style={[styles.signatureContainer, { alignItems: 'flex-end' }]}>
          {customerSignature ? (
            <Image
              src={customerSignature}
              style={styles.signatureImage}
            />
          ) : (
            <View
              style={[
                styles.signaturePlaceholder,
                {
                  height: 80,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={{ fontSize: 9, color: '#777', textAlign: 'center' }}>
                [Company Stamp/Signature]
              </Text>
            </View>
          )}

          <Text style={[styles.signatureLabel, { marginTop: 10, textAlign: 'right' }]}>
            AUTHORIZED SIGNATORY
          </Text>
          <Text style={[styles.signatureSubLabel, { textAlign: 'right' }]}>
            For GRAV CLOTHING
          </Text>
          <Text
            style={{
              fontSize: 9,
              color: '#777',
              marginTop: 8,
              textAlign: 'right',
            }}
          >
          </Text>
        </View>
      </View>

    </View>

    <View style={styles.footerDivider}>
      <Text style={styles.footerText}>This is a computer-generated quotation.</Text>
      <Text style={[styles.footerText, { fontSize: 8 }]}>
        Generated on {new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })} | Page {pageNumber} of {totalPages}
      </Text>
    </View>
  </View>
);

// Component for continuation header
const PDFContinuationHeader = ({ quotation, pageNumber }) => (
  <View style={styles.continuationHeader}>
    <Text style={styles.continuationTitle}>QUOTATION CONTINUED</Text>
    <Text style={styles.continuationSubtitle}>
      Quotation No: {quotation.quotationNumber || 'N/A'} | Page {pageNumber}
    </Text>
  </View>
);

// Main PDF Document Component
const QuotationPDFDocument = ({
  quotation,
  request,
  companyLogo,
  customerSignature
}) => {
  const items = quotation.items || [];
  const itemsPerPage = 12; // Formal number of items per page
  const totalItemsPages = Math.ceil(items.length / itemsPerPage);

  // Calculate total pages
  const totalPages = Math.max(totalItemsPages, 1) + 1; // Items pages + 1 summary page

  return (
    <Document>
      {/* Items Pages */}
      {items.length > 0 ? (
        Array.from({ length: totalItemsPages }).map((_, pageIndex) => {
          const startIndex = pageIndex * itemsPerPage;
          const isFirstPage = pageIndex === 0;
          const currentPage = pageIndex + 1;

          return (
            <Page
              key={`items-${pageIndex}`}
              size="A4"
              style={styles.page}
              wrap={false}
            >
              <View style={styles.container}>
                {isFirstPage ? (
                  <>
                    <PDFHeader quotation={quotation} request={request} companyLogo={companyLogo} />
                    <PDFCustomerDetails quotation={quotation} request={request} />
                    <PDFOpeningMessage request={request} />
                  </>
                ) : (
                  <PDFContinuationHeader quotation={quotation} pageNumber={currentPage} />
                )}

                <PDFItemsTable
                  items={items}
                  startIndex={startIndex}
                  itemsPerPage={itemsPerPage}
                  pageNumber={currentPage}
                  totalItems={items.length}
                />

                {/* Page number - Bottom center */}
                <Text style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </Text>
              </View>
            </Page>
          );
        })
      ) : (
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            <PDFHeader quotation={quotation} request={request} companyLogo={companyLogo} />
            <PDFCustomerDetails quotation={quotation} request={request} />
            <PDFOpeningMessage request={request} />
            <Text style={{
              textAlign: 'center',
              color: '#777',
              padding: 30,
              fontStyle: 'italic',
              fontSize: 11
            }}>
              No items in quotation
            </Text>
            <PDFPriceSummary quotation={quotation} />
            <PDFTermsAndConditions quotation={quotation} />
            <PDFFooter
              pageNumber={1}
              totalPages={1}
              customerSignature={customerSignature}
            />
          </View>
        </Page>
      )}

      {/* Summary Page (always last) */}
      {items.length > 0 && (
        <Page key="summary" size="A4" style={styles.page} wrap={false}>
          <View style={styles.container}>
            <PDFContinuationHeader quotation={quotation} pageNumber={totalPages} />

            <View style={{ textAlign: 'center', marginBottom: 15, marginTop: 10 }}>
              <Text style={{ color: '#222', fontSize: 14, fontWeight: 'bold' }}>
                SUMMARY & TERMS
              </Text>
            </View>

            <PDFPriceSummary quotation={quotation} />
            <PDFTermsAndConditions quotation={quotation} />

            <PDFFooter
              pageNumber={totalPages}
              totalPages={totalPages}
              customerSignature={customerSignature}
            />
          </View>
        </Page>
      )}
    </Document>
  );
};

// Main React Component
export default function QuotationPDFDownload({
  quotation,
  request,
  companyLogo = "data:image/png;base64,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",
 customerSignature = "data:image/png;base64,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"
}) {
  if (!quotation || !request) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md opacity-50 cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </button>
    );
  }

  // Validate required data
  if (!quotation.quotationNumber || !quotation.items || !request.customerInfo) {
    return (
      <button
        onClick={() => alert("Incomplete quotation data. Please save the quotation first.")}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <QuotationPDFDocument
          quotation={quotation}
          request={request}
          companyLogo={companyLogo}
          customerSignature={customerSignature}
        />
      }
      fileName={`Quotation_${quotation.quotationNumber}_${formatDate(quotation.date).replace(/ /g, '_')}.pdf`}
      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors no-underline"
    >
      {({ loading }) => (
        <>
          <Download className="w-4 h-4" />
          {loading ? 'Generating...' : 'Download Quotation'}
        </>
      )}
    </PDFDownloadLink>
  );
}