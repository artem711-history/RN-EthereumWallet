import React from 'react';
import { Column } from '../layout';

const TransactionSheet = ({ children, ...props }) => {
  return <Column {...props}>{children}</Column>;
};

export default TransactionSheet;
