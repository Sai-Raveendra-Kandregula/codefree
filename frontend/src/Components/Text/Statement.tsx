import React from 'react'

export type StatementProps = {
    statement: string;
};

function Statement({
    statement
} : StatementProps) {
  return (
    <span style={{
        fontSize: '2.5rem',
        fontWeight: 'bold' ,
        margin: '0.75rem'
    }}>{statement}</span>
  )
}

export default Statement