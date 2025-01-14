import React from 'react';
import CardStyles from './Card.module.css'

type CardSize = 'sm' | 'md' | 'lg';

export type CardProps = {
    title?: string; // Optional prop for the card's title
    children: React.ReactNode; // Required prop for the card's content
    size?: CardSize; // Optional prop to specify the size of the card (default is 'md')
}; // Define the props for Card Component

const Card: React.FC<CardProps> = ({
    title,
    children,
    size = 'md',
}) => {
    return (
        <div className={`${CardStyles.card} ${CardStyles[size]}`}>
            {
                title && (
                    <h3 className={`${CardStyles.heading}`}>{title}</h3>
                )
            }
            {children}
        </div>
    );
};

export default Card;
