import React from 'react'
import '../styles/CFTable.css'

function CFTable({
    data = [],
    COLUMNS = [],
    ROW_PROPS = {
        key: (item) => {},
        title: (item) => {},
        onClick: (item) => {},
    }
}) {
  return (
    <table style={{
        width: '100%',
        textAlign: 'center',
        borderCollapse: 'collapse'
    }}>
        <thead>
            <tr className='header-row'>
                {
                    COLUMNS.map((col, ind) => {
                        return <th key={col['label']} style={{
                            borderBottom: '1px solid var(--border-color)',
                            padding: '10px'
                        }}>
                            {col['label']}
                        </th>
                    })
                }
            </tr>
        </thead>
        <tbody>
            {
                data.map((item, row_ind) => {
                    return <tr 
                    className={ROW_PROPS.onClick ? 'clickable-row' : null}
                    key={ROW_PROPS.key ? ROW_PROPS.key(item) : null} 
                    title={ROW_PROPS.title ? ROW_PROPS.title(item) : null} 
                    onClick={ROW_PROPS.onClick ? () => {
                        ROW_PROPS.onClick(item)
                    } : null}
                    style={{
                        cursor: ROW_PROPS.onClick ? 'pointer' : 'initial'
                    }}
                    >
                        {
                            COLUMNS.map((col) => {
                                return <td key={`${col['label']}_${row_ind}`} style={{
                                    padding: '10px 20px'
                                }}>
                                    {col['renderCell'](item)}
                                </td>
                            })
                        }
                    </tr>
                })
            }
        </tbody>
    </table>
  )
}

export default CFTable