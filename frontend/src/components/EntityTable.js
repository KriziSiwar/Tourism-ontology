import React from 'react';

const EntityTable = ({ data, columns, onEdit, onDelete, entityName, idField }) => {
  return (
    <div className="entity-table">
      <div className="table-header">
        <h2>{entityName} Management</h2>
        <button className="add-btn" onClick={() => onEdit(null)}>
          Add New {entityName.slice(0, -1)}
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const uri = item[idField]?.value || '';
              const id = uri.split('#')[1] || `item_${index}`;
              return (
                <tr key={index}>
                  {columns.map(col => (
                    <td key={col}>
                      {item[col]?.value || '-'}
                    </td>
                  ))}
                  <td className="actions">
                    <button className="edit-btn" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => onDelete(id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntityTable;