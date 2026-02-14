'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    contractTemplates, 
    categories, 
    ContractTemplate, 
    TemplateField,
    getTemplateById 
} from '@/lib/contractTemplates';

import React from 'react';

// Map emoji icon strings from template data to SVG icons
const getTemplateIconSvg = (icon: string, size: string = 'w-6 h-6'): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
        '🤝': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
        '🔒': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
        '💼': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
        '🛒': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
        '⚠️': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
        '📸': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>,
        '👔': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
        '📊': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
        '📝': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
        '✅': <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return iconMap[icon] || <svg className={`${size} text-stone-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
};

interface ContractTemplatePickerProps {
    onSelect: (template: ContractTemplate, filledContent: string) => void;
    onClose: () => void;
    isPro?: boolean;
}

interface FieldValues {
    [key: string]: string;
}

export function ContractTemplatePicker({ onSelect, onClose, isPro = false }: ContractTemplatePickerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
    const [fieldValues, setFieldValues] = useState<FieldValues>({});
    const [step, setStep] = useState<'categories' | 'templates' | 'fields' | 'preview'>('categories');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter templates based on search
    const filteredTemplates = useMemo(() => {
        let templates = contractTemplates;
        
        if (selectedCategory) {
            templates = templates.filter(t => t.category === selectedCategory);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            templates = templates.filter(t => 
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }
        
        return templates;
    }, [selectedCategory, searchQuery]);

    // Fill template content with values
    const generateFilledContent = () => {
        if (!selectedTemplate) return '';
        
        let content = selectedTemplate.content;
        Object.entries(fieldValues).forEach(([key, value]) => {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
        });
        return content;
    };

    // Handle field change
    const handleFieldChange = (fieldId: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    // Check if all required fields are filled
    const allRequiredFilled = useMemo(() => {
        if (!selectedTemplate) return false;
        return selectedTemplate.fields
            .filter(f => f.required)
            .every(f => fieldValues[f.id]?.trim());
    }, [selectedTemplate, fieldValues]);

    // Handle template selection
    const handleTemplateSelect = (template: ContractTemplate) => {
        if (template.isPro && !isPro) {
            // Show pro upgrade prompt
            return;
        }
        setSelectedTemplate(template);
        // Initialize field values with empty strings
        const initialValues: FieldValues = {};
        template.fields.forEach(f => { initialValues[f.id] = ''; });
        setFieldValues(initialValues);
        setStep('fields');
    };

    // Handle final selection
    const handleConfirm = () => {
        if (selectedTemplate && allRequiredFilled) {
            onSelect(selectedTemplate, generateFilledContent());
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-stone-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {step !== 'categories' && (
                            <button
                                onClick={() => {
                                    if (step === 'templates') setStep('categories');
                                    else if (step === 'fields') setStep('templates');
                                    else if (step === 'preview') setStep('fields');
                                }}
                                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">
                                {step === 'categories' && 'Contract Templates'}
                                {step === 'templates' && categories.find(c => c.id === selectedCategory)?.name}
                                {step === 'fields' && selectedTemplate?.name}
                                {step === 'preview' && 'Preview Document'}
                            </h3>
                            <p className="text-sm text-stone-500">
                                {step === 'categories' && 'Choose a category to get started'}
                                {step === 'templates' && 'Select a template'}
                                {step === 'fields' && 'Fill in the details'}
                                {step === 'preview' && 'Review before creating'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <AnimatePresence mode="wait">
                        {/* Categories View */}
                        {step === 'categories' && (
                            <motion.div
                                key="categories"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {/* Search */}
                                <div className="relative mb-6">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search all templates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                                    />
                                </div>

                                {searchQuery ? (
                                    /* Search Results */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredTemplates.length === 0 ? (
                                            <p className="col-span-2 text-center py-12 text-stone-500">
                                                No templates found for "{searchQuery}"
                                            </p>
                                        ) : (
                                            filteredTemplates.map((template) => (
                                                <TemplateCard
                                                    key={template.id}
                                                    template={template}
                                                    isPro={isPro}
                                                    onClick={() => handleTemplateSelect(template)}
                                                />
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    /* Category Grid */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories.map((category) => {
                                            const count = contractTemplates.filter(t => t.category === category.id).length;
                                            return (
                                                <button
                                                    key={category.id}
                                                    onClick={() => {
                                                        setSelectedCategory(category.id);
                                                        setStep('templates');
                                                    }}
                                                    className="p-6 bg-gradient-to-br from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 rounded-2xl text-left transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-stone-200/60 flex items-center justify-center mb-3">{getTemplateIconSvg(category.icon, 'w-5 h-5')}</div>
                                                    <h4 className="font-bold text-stone-900 group-hover:text-stone-800">
                                                        {category.name}
                                                    </h4>
                                                    <p className="text-sm text-stone-500 mt-1">
                                                        {category.description}
                                                    </p>
                                                    <p className="text-xs text-stone-400 mt-3">
                                                        {count} template{count !== 1 ? 's' : ''}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Templates View */}
                        {step === 'templates' && (
                            <motion.div
                                key="templates"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {filteredTemplates.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        isPro={isPro}
                                        onClick={() => handleTemplateSelect(template)}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* Fields View */}
                        {step === 'fields' && selectedTemplate && (
                            <motion.div
                                key="fields"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedTemplate.fields.map((field) => (
                                        <FieldInput
                                            key={field.id}
                                            field={field}
                                            value={fieldValues[field.id] || ''}
                                            onChange={(value) => handleFieldChange(field.id, value)}
                                        />
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setStep('preview')}
                                        disabled={!allRequiredFilled}
                                        className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Preview Document →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Preview View */}
                        {step === 'preview' && selectedTemplate && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div 
                                    className="border border-stone-200 rounded-xl p-6 bg-white max-h-[50vh] overflow-y-auto shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: generateFilledContent() }}
                                />

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setStep('fields')}
                                        className="px-6 py-3 border border-stone-200 hover:bg-stone-50 rounded-xl font-medium transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Use This Template
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Template Card Component
function TemplateCard({ 
    template, 
    isPro, 
    onClick 
}: { 
    template: ContractTemplate; 
    isPro: boolean; 
    onClick: () => void;
}) {
    const isLocked = template.isPro && !isPro;

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`p-5 rounded-2xl text-left transition-all group border ${
                isLocked 
                    ? 'bg-stone-50 border-stone-200 cursor-not-allowed opacity-70' 
                    : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-lg'
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">{getTemplateIconSvg(template.icon, 'w-5 h-5')}</div>
                {template.isPro && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isPro ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {isPro ? '✓ PRO' : (<><svg className="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> PRO</>)}
                    </span>
                )}
            </div>
            <h4 className="font-bold text-stone-900 group-hover:text-stone-700">
                {template.name}
            </h4>
            <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                {template.description}
            </p>
            <p className="text-xs text-stone-400 mt-3">
                {template.fields.length} field{template.fields.length !== 1 ? 's' : ''} to fill
            </p>
        </button>
    );
}

// Field Input Component
function FieldInput({ 
    field, 
    value, 
    onChange 
}: { 
    field: TemplateField; 
    value: string; 
    onChange: (value: string) => void;
}) {
    const baseClasses = "w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent";

    return (
        <div className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-stone-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={baseClasses + ' resize-none'}
                />
            ) : field.type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseClasses}
                >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={baseClasses}
                />
            )}
        </div>
    );
}

// Small button to open the template picker
export function ContractTemplateButton({ 
    onClick 
}: { 
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-stone-900 to-stone-700 hover:from-stone-800 hover:to-stone-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Contract Templates
        </button>
    );
}
