import React from 'react'
import {useBreakpoint} from '../hooks/useBreakpoint'
import '../styles/CFTable.css'

function CFTable({
    data = [],
    COLUMNS = [],
    ROW_PROPS = {
        key: (item) => { },
        title: (item) => { },
        onClick: (item) => { },
    },
    theme = {},
    showHeader=true
}) {

    const breakpoint = useBreakpoint();

    return (
        <table style={{
            width: '100%',
            textAlign: 'center',
            borderCollapse: 'collapse',
            ...theme['table']
        }}>
            {
                showHeader &&
                <thead>
                    <tr className='header-row'>
                        {
                            COLUMNS.map((col, ind) => {
                                if(col['showOnlyIn'] && !col['showOnlyIn'].includes(breakpoint)){
                                    return null;
                                }
                                return <th key={col['label']} style={theme.th ? theme.th : {}}>
                                    {col['label']}
                                </th>
                            })
                        }
                    </tr>
                </thead>
            }
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
                                COLUMNS.map((col, col_ind, col_arr) => {                                    
                                    if(col['showOnlyIn'] && !col['showOnlyIn'].includes(breakpoint)){
                                        return null;
                                    }
                                    
                                    const out = <td key={`${col['label']}_${row_ind}`} style={
                                         {
                                            borderRadius: theme.rowRadius ? 
                                            `${col_ind === 0 ? theme.rowRadius : 0} ${col_ind === col_arr.length - 1 ? theme.rowRadius : 0} ${col_ind === col_arr.length - 1 ? theme.rowRadius : 0} ${col_ind === 0 ? theme.rowRadius : 0}`                                           
                                            : '0',
                                            ...theme.td
                                        }
                                        }>
                                        {col['renderCell'](item)}
                                    </td>
                                    
                                    return out
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