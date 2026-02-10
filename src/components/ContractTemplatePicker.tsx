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
                                                    <span className="text-3xl mb-3 block">{category.icon}</span>
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
                                        className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors"
                                    >
                                        ✍️ Use This Template
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
                <span className="text-2xl">{template.icon}</span>
                {template.isPro && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isPro ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {isPro ? '✓ PRO' : '🔒 PRO'}
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
