import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'

const DisplayWriters = ({ writers, toggleWriters, showWriters, tooltipRef }) => {
    if (writers.length <= 2) {
        return <span className='text-gray-500'>{writers.join(', ')}</span>;
    }
    return (
        <div className="relative inline-block">
            <span className='text-gray-500'>{writers.slice(0, 2).join(', ')}, ... </span>
            <button
                onClick={toggleWriters}
                className="ml-2 px-1 py-0.5 bg-zinc-800 rounded-full inline-flex items-center justify-center"
                aria-label="Toggle writers"
            >
                <FontAwesomeIcon icon={showWriters ? faChevronUp : faChevronDown} className="text-xs" />
            </button>

            {showWriters && (
                <div ref={tooltipRef} className="absolute z-10 mt-1 -left-2 w-60 p-2 bg-zinc-800 text-white rounded shadow-lg">
                    <p className="text-sm font-medium m-1">More Writers</p>
                    <div className="max-h-32 overflow-y-auto m-1">
                        <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {writers.slice(2).map((writer, index) => (
                                <li key={index} className="text-xs text-gray-300">{writer}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DisplayWriters