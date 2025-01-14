import React, { CSSProperties, useMemo, useRef, useState } from 'react'
import MiniBarStyles from './MiniBar.module.css'

type MiniBarDataPoint = {
    label: string
    value: number
}

type AxesBoolean = {
    xAxis: boolean
    yAxis: boolean
}

type MiniBarProps = {
    dataPoints: Array<MiniBarDataPoint>,
    xAxisLabel?: string
    yAxisLabel?: string
    showAxes?: AxesBoolean,
    maxValue?: number
    maxEntries?: number | 'auto',
    containerStyle?: CSSProperties,
    valueFormatter?: (value: number) => string
}

function MiniBar({
    dataPoints,
    xAxisLabel,
    yAxisLabel,
    maxValue,
    maxEntries = 5,
    showAxes = { xAxis: true, yAxis: true },
    valueFormatter = (value) => `${value}`,
    containerStyle
}: MiniBarProps) {
    const [, setMaxValue] = useState(0)

    const dataContainerRef = useRef<HTMLDivElement>(null)

    const [popupData, setPopupData] = useState<MiniBarDataPoint | undefined>(undefined);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const plottedDataPoints = useMemo(() => {
        if (maxEntries !== 'auto' && dataPoints.length > maxEntries) {
            return dataPoints.slice(-1 * maxEntries)
        }
        return dataPoints
    }, [dataPoints, maxEntries])

    const _maxValue = useMemo(() => {
        if (maxValue) {
            return maxValue
        }
        return Math.max(...plottedDataPoints.map((val) => val.value))

    }, [maxValue, plottedDataPoints])

    return (
        <div className={`${MiniBarStyles.container}`} style={containerStyle}>
            {
                yAxisLabel && yAxisLabel.length > 0 && showAxes.yAxis && 
                <div className={`${MiniBarStyles.yAxisContainer}`}>
                    {yAxisLabel}
                </div>
            }
            {
                xAxisLabel && xAxisLabel.length > 0 && showAxes.xAxis &&
                <div className={`${MiniBarStyles.xAxisContainer}`}>
                    {xAxisLabel}
                </div>
            }
            <div ref={dataContainerRef} className={`${MiniBarStyles.dataContainer}`}
                onMouseMove={(e) => {
                    const dataContainer = dataContainerRef.current;
                    if (dataContainer) {
                        const bounding_rect = dataContainer.getBoundingClientRect()
                        setTimeout(() => {
                            setMousePosition({
                                x: e.clientX - bounding_rect.left,
                                y: e.clientY - bounding_rect.top
                            });
                        }, 250)
                    }
                }}
            >
                {popupData && (
                    <div
                        style={{
                            position: 'absolute',
                            top: mousePosition.y,
                            left: mousePosition.x,
                            backgroundColor: 'rgba(20,20,20,0.75)',
                            border: '1px solid var(--border-color)',
                            padding: '10px',
                            zIndex: 1000,
                            opacity: popupData ? 1 : 0,
                            pointerEvents: 'none'
                        }}
                    >
                        <small>
                            <b>{yAxisLabel && `${yAxisLabel} : `}{valueFormatter(popupData.value)}</b>
                        </small>
                    </div>
                )}
                {plottedDataPoints.map((val) => {
                    return (
                        <span className={`${MiniBarStyles.dataItem}`} style={{
                            height: `calc(100% * ${val.value / _maxValue})`
                        }}
                            onMouseEnter={(e) => {
                                setPopupData(val)
                            }}
                            onMouseLeave={(e) => {
                                setPopupData(undefined)
                            }}
                        >

                        </span>
                    )
                })}
            </div>
        </div>
    )
}

export default MiniBar