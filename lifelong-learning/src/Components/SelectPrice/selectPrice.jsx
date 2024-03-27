import React, { useState } from 'react';

const selectPrice = ({ label, options, value, onChange, className }) => {
    return (
        <div className={`relative ${className}`}>
            {label && <label className="text-sm text-gray-400 mb-2 block">{label}</label>}
            <select
                className="block w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={value}
                onChange={onChange}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
export default selectPrice;