import React from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: Array<Record<string, React.ReactNode>>;
  stackOnMobile?: boolean;
  horizontalScroll?: boolean;
  stickyHeader?: boolean;
  caption?: string;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  stackOnMobile = true,
  horizontalScroll = false,
  stickyHeader = false,
  caption,
  onSort,
  sortColumn,
  sortDirection,
  className = ''
}) => {
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const tableClasses = [
    styles.table,
    stackOnMobile ? styles.tableStack : '',
    horizontalScroll ? styles.tableScroll : '',
    stickyHeader ? styles.stickyHeader : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.tableWrapper}>
      <table className={tableClasses} role="table">
        {caption && <caption className={styles.caption}>{caption}</caption>}
        
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                id={`col-${column.key}`}
                scope="col"
                className={styles.th}
                style={column.width ? { ['--col-width' as any]: column.width } : undefined}
              >
                {column.sortable && onSort ? (
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => handleSort(column.key)}
                    aria-label={`Sort by ${column.header} ${
                      sortColumn === column.key 
                        ? sortDirection === 'asc' ? 'descending' : 'ascending'
                        : 'ascending'
                    }`}
                  >
                    {column.header}
                    <span className={styles.sortIcon} aria-hidden="true">
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? '↑' : '↓'
                      ) : (
                        '↕'
                      )}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={styles.tr}>
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className={styles.td}
                  data-label={column.header}
                  headers={`col-${column.key}`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;