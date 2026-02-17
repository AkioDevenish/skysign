'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedAiIcon } from './AnimatedAiIcon';
import { 
    contractTemplates, 
    ContractTemplate,
    TemplateField,
    getTemplateById,
    categories
} from '@/lib/contractTemplates';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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
    onClose?: () => void;
    isPro?: boolean;
    embedded?: boolean;
    initialCategory?: string | null;
}

interface FieldValues {
    [key: string]: string;
}

export function ContractTemplatePicker({ onSelect, onClose, isPro = false, embedded = false, initialCategory }: ContractTemplatePickerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
    const [fieldValues, setFieldValues] = useState<FieldValues>({});
    const [step, setStep] = useState<'categories' | 'templates' | 'view-template' | 'edit-template' | 'fields' | 'preview'>(initialCategory ? 'templates' : 'categories');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Convex integrations
    const customTemplatesRaw = useQuery(api.templates.list);
    const createTemplate = useMutation(api.templates.create);
    const updateTemplate = useMutation(api.templates.update);
    const deleteTemplate = useMutation(api.templates.deleteTemplate);
    
    // AI Generation
    const generateContract = useAction(api.ai.generateContract);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Initial category navigation effect
    useEffect(() => {
        if (initialCategory) {
            setSelectedCategory(initialCategory);
            setStep('templates');
        } else {
            setSelectedCategory(null);
            setStep('categories');
        }
    }, [initialCategory]);

    // Merge static and custom templates
    const allTemplates = useMemo(() => {
        const custom: ContractTemplate[] = (customTemplatesRaw || []).map(t => ({
            id: t._id,
            name: t.name,
            category: t.category as any, // Cast to match union type
            description: t.description || '',
            icon: '📝',
            isPro: false,
            fields: t.fields,
            content: t.content
        }));
        return [...custom, ...contractTemplates];
    }, [customTemplatesRaw]);

    // Filter templates based on search
    const filteredTemplates = useMemo(() => {
        let templates = allTemplates;
        
        if (selectedCategory === 'my-templates') {
            const staticIds = new Set(contractTemplates.map(t => t.id));
            templates = templates.filter(t => !staticIds.has(t.id));
        } else if (selectedCategory) {
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
    }, [selectedCategory, searchQuery, allTemplates]);

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
        setStep('view-template');
    };

    // Create new custom template
    const handleCreateNew = () => {
        const newTemplate: ContractTemplate = {
            id: `custom-${Date.now()}`,
            name: 'Untitled Contract',
            category: 'contract' as any, // default
            description: 'Custom contract template',
            icon: '📝',
            isPro: false,
            fields: [],
            content: ''
        };
        setSelectedTemplate(newTemplate);
        setStep('edit-template');
    };

    const handleGenerateWithAi = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const content = await generateContract({ prompt: aiPrompt });
            
            const newTemplate: ContractTemplate = {
                id: `custom-${Date.now()}`,
                name: 'AI Generated Contract',
                category: 'contract' as any,
                description: `Generated from: "${aiPrompt}"`,
                icon: '✨',
                isPro: false,
                fields: [],
                content: content
            };
            
            setSelectedTemplate(newTemplate);
            setStep('edit-template');
            setShowAiModal(false);
            setAiPrompt('');
        } catch (error: any) {
            console.error("AI Generation failed:", error);
            alert("Failed to generate contract: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveEdit = async (newContent: string) => {
        if (!selectedTemplate) return;

        // Parse fields from content regex {{variable}}
        const regex = /{{([^}]+)}}/g;
        const matches = [...newContent.matchAll(regex)];
        const newFields: TemplateField[] = [];
        const seen = new Set();

        matches.forEach(match => {
            const id = match[1].trim();
            if (!seen.has(id)) {
                seen.add(id);
                // Check if field already existed to preserve type/label if possible, else default
                const existing = selectedTemplate.fields.find(f => f.id === id);
                newFields.push({
                    id,
                    label: existing?.label || id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1').trim(), // camelCase to Title Case
                    type: existing?.type || 'text',
                    required: true,
                    placeholder: existing?.placeholder || `Enter ${id}...`
                });
            }
        });

        const updatedTemplate = {
            ...selectedTemplate,
            content: newContent,
            fields: newFields
        };

        // Persist to DB
        try {
            if (selectedTemplate.id.startsWith('custom-')) {
                // Create new
                const newId = await createTemplate({
                    name: selectedTemplate.name, // The user might want to edit name too, but for now use existing
                    description: selectedTemplate.description,
                    category: selectedTemplate.category,
                    content: newContent,
                    fields: newFields,
                });
                updatedTemplate.id = newId;
            } else {
                // Update existing if it is a custom template (check if ID is valid Convex ID, rough check)
                // Static templates cannot be updated in DB, they are file based.
                // We should probably check if it's in customTemplates list.
                const isCustom = customTemplatesRaw?.some(t => t._id === selectedTemplate.id);
                if (isCustom) {
                    await updateTemplate({
                        id: selectedTemplate.id as Id<"customTemplates">,
                        content: newContent,
                        fields: newFields,
                    });
                } else {
                    // It's a static template being edited -> treat as new copy?
                    // For now, let's just create a copy if they edit a static one?
                    // Or maybe we blocked editing static ones? 
                    // current UI allows editing anything. 
                    // If editing static, we should probably Fork it.
                    const newId = await createTemplate({
                        name: `${selectedTemplate.name} (Copy)`,
                        description: selectedTemplate.description,
                        category: selectedTemplate.category,
                        content: newContent,
                        fields: newFields,
                    });
                    updatedTemplate.id = newId;
                    updatedTemplate.name = `${selectedTemplate.name} (Copy)`;
                }
            }

            setSelectedTemplate(updatedTemplate);
            setStep('view-template');
        } catch (error) {
            console.error("Failed to save template:", error);
            // Optionally show toast
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedTemplate) return;
        if (confirm('Are you sure you want to delete this template?')) {
             await deleteTemplate({ id: selectedTemplate.id as Id<"customTemplates"> });
             setSelectedTemplate(null);
             setStep('templates');
        }
    };

    // Handle final selection
    const handleConfirm = () => {
        if (selectedTemplate && allRequiredFilled) {
            onSelect(selectedTemplate, generateFilledContent());
        }
    };


    const Container = embedded ? 'div' : motion.div;
    const Wrapper = embedded ? React.Fragment : motion.div;
    
    // Wrapper props
    const wrapperProps = embedded ? {} : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
        onClick: onClose
    };

    // Container props
    const containerProps = embedded ? {
        className: "w-full flex flex-col h-full bg-stone-50"
    } : {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        className: "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col",
        onClick: (e: React.MouseEvent) => e.stopPropagation()
    };

    return (
        <Wrapper {...wrapperProps}>
            <Container {...containerProps}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 ${embedded ? '' : 'border-b border-stone-200'} flex-shrink-0`}>
                    <div className="flex items-center gap-3">
                        {step !== 'categories' && !(initialCategory && step === 'templates') && (
                            <button
                                onClick={() => {
                                    if (step === 'templates') setStep('categories');
                                    else if (step === 'view-template') setStep('templates');
                                    else if (step === 'edit-template') {
                                        if (selectedTemplate?.id.startsWith('custom-')) {
                                            setStep('categories');
                                        } else {
                                            setStep('view-template');
                                        }
                                    }
                                    else if (step === 'fields') setStep('view-template');
                                    else if (step === 'preview') setStep('fields');
                                }}
                                className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">
                                {step === 'categories' && 'Contract Templates'}
                                {step === 'templates' && (selectedCategory === 'my-templates' ? 'My Templates' : categories.find(c => c.id === selectedCategory)?.name)}
                                {step === 'view-template' && selectedTemplate?.name}
                                {step === 'edit-template' && (selectedTemplate?.id.startsWith('custom-') ? 'Create New Template' : 'Edit Template')}
                                {step === 'fields' && 'Fill Details'}
                                {step === 'preview' && 'Final Review'}
                            </h3>
                            <p className="text-sm text-stone-500">
                                {step === 'categories' && 'Choose a category to get started'}
                                {step === 'templates' && (selectedCategory === 'my-templates' ? 'Templates you created' : 'Select a template')}
                                {step === 'view-template' && 'Read through the template'}
                                {step === 'edit-template' && 'Customize the document content'}
                                {step === 'fields' && 'Fill in the placeholders'}
                                {step === 'preview' && 'Review before creating'}
                            </p>
                        </div>
                    </div>
                    {!embedded && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
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
                                                No templates found for &quot;{searchQuery}&quot;
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
                                        {/* Create New Card */}
                                        <button
                                            onClick={handleCreateNew}
                                            className="p-6 bg-white border-2 border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50 rounded-2xl text-left transition-all group flex flex-col items-center justify-center text-center h-full min-h-[160px]"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3 group-hover:bg-stone-200 transition-colors">
                                                <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <h4 className="font-bold text-stone-900">Create Custom</h4>
                                            <p className="text-sm text-stone-500 mt-1">Start from scratch</p>
                                        </button>

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
                        
                        {/* View Template (Read-only Preview) */}
                        {step === 'view-template' && selectedTemplate && (
                            <motion.div
                                key="view-template"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full flex flex-col"
                            >
                                <div 
                                    className="flex-1 border border-stone-200 rounded-xl p-8 bg-white overflow-y-auto shadow-inner mb-6 prose prose-stone max-w-none"
                                >
                                    {/* We render the raw content but perhaps highlight placeholders */}
                                    <div dangerouslySetInnerHTML={{ 
                                        __html: selectedTemplate.content.replace(/{{([^}]+)}}/g, '<span class="bg-yellow-100 text-yellow-800 px-1 rounded border border-yellow-200 font-mono text-sm">{{$1}}</span>')
                                    }} />
                                </div>

                                <div className="flex justify-between gap-3 pb-2 pt-4 border-t border-stone-100">
                                    <button
                                        onClick={() => setStep('edit-template')}
                                        className="px-4 py-3 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Template
                                    </button>

                                    {/* Delete Button for Custom Templates */}
                                    {customTemplatesRaw?.some(t => t._id === selectedTemplate.id) && (
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    )}

                                     <button
                                        onClick={() => setStep('fields')}
                                        className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-stone-900/10"
                                    >
                                        Start Filling
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Edit Template View */}
                        {step === 'edit-template' && selectedTemplate && (
                            <motion.div
                                key="edit-template"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex-1 flex flex-col min-h-0">
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Edit Document Content
                                    </label>
                                    <div className="flex-1 min-h-0">
                                        <RichTextEditor
                                            initialContent={selectedTemplate.content}
                                            onChange={(newHtml) => {
                                                selectedTemplate.content = newHtml; // sync with ref
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
                                     <button
                                        onClick={() => {
                                            // The content is already synced to selectedTemplate.content via the onChange prop mutation
                                            // But for safety, we should pass it explicitly if we could. 
                                            // Since we mutated the object reference above, we can just pass it.
                                            handleSaveEdit(selectedTemplate.content);
                                        }}
                                        className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        Save & Preview
                                    </button>
                                </div>
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
            </Container>

            {/* AI Floating Action Button - Premium Design */}
            {(step === 'categories' || step === 'templates') && (
                <button
                    onClick={() => setShowAiModal(true)}
                    className="fixed bottom-8 right-8 group z-40 outline-none cursor-pointer"
                    title="Generate with AI"
                >
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-75 transition-opacity duration-500" />
                    
                    {/* Main button */}
                    <div className="relative w-14 h-14 bg-stone-900 rounded-full flex items-center justify-center text-white border border-stone-700 shadow-2xl group-hover:scale-105 transition-transform duration-300 active:scale-95">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>

                    {/* Tooltip Label */}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3 py-1.5 bg-stone-900 text-white text-sm font-medium rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap border border-stone-800 pointer-events-none shadow-xl">
                        Generate with AI
                    </span>
                </button>
            )}

            {/* AI Generation Modal - Clean Light Theme */}
            <AnimatePresence>
                {showAiModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAiModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl shadow-stone-900/20 overflow-hidden ring-1 ring-black/5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 md:p-8">
                                {/* Header */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="pt-1">
                                        <AnimatedAiIcon className="w-8 h-8 text-stone-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-900">Generate with AI</h3>
                                        <p className="text-stone-500 mt-1">Describe the contract requirements and our AI will draft a solid starting point for you.</p>
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="space-y-3">
                                    <textarea
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="e.g. Freelance agreement for a Senior Designer, $8k/month, IP rights transfer..."
                                        className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all resize-none text-base leading-relaxed"
                                        autoFocus
                                    />
                                    
                                    {/* Quick Suggestions */}
                                    <div className="flex flex-wrap gap-2">
                                        {['NDA', 'Freelance Contract', 'Lease Agreement'].map(suggestion => (
                                            <button 
                                                key={suggestion}
                                                onClick={() => setAiPrompt(prompt => prompt ? prompt + ' ' + suggestion : suggestion)}
                                                className="px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 rounded-lg text-xs font-medium text-stone-600 transition-colors cursor-pointer"
                                            >
                                                + {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-stone-50 p-4 px-6 md:px-8 flex justify-between items-center border-t border-stone-100">
                                <button
                                    onClick={() => setShowAiModal(false)}
                                    className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateWithAi}
                                    disabled={!aiPrompt.trim() || isGenerating}
                                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:hover:bg-stone-900 text-white rounded-xl font-semibold shadow-lg shadow-stone-900/20 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <span>Generate Draft</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Wrapper>
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
                        isPro ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
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

// Basic Rich Text Editor Component
function RichTextEditor({ 
    initialContent, 
    onChange 
}: { 
    initialContent: string; 
    onChange: (html: string) => void; 
}) {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState<Record<string, any>>({});

    const checkFormats = React.useCallback(() => {
        if (typeof document === 'undefined') return;
        try {
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                justifyLeft: document.queryCommandState('justifyLeft'),
                justifyCenter: document.queryCommandState('justifyCenter'),
                justifyRight: document.queryCommandState('justifyRight'),
                insertUnorderedList: document.queryCommandState('insertUnorderedList'),
                insertOrderedList: document.queryCommandState('insertOrderedList'),
                block: document.queryCommandValue('formatBlock').toLowerCase(),
            });
        } catch (e) {
            // Ignore errors
        }
    }, []);

    // Sync content changes
    const handleInput = React.useCallback(() => {
        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            onChange(newHtml); 
        }
    }, [onChange]);

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleInput(); // sync immediately
        checkFormats(); // Check formats after command
        editorRef.current?.focus();
    };

    const insertField = () => {
        const name = prompt("Enter field name (e.g., clientName):");
        if (name) {
            // Remove spaces and special chars for the variable name
            const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
            // Insert the placeholder
            const placeholder = `{{${cleanName}}}`;
            document.execCommand('insertText', false, placeholder);
            handleInput();
        }
    };

    return (
        <div className="border border-stone-200 rounded-xl overflow-hidden flex flex-col bg-white h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-stone-200 bg-stone-50 overflow-x-auto">
                <ToolButton icon={<span className="font-serif font-bold text-base">B</span>} label="Bold" command="bold" onClick={() => execCmd('bold')} bold isActive={activeFormats.bold} />
                <ToolButton icon={<span className="font-serif italic font-bold text-base">I</span>} label="Italic" command="italic" onClick={() => execCmd('italic')} italic isActive={activeFormats.italic} />
                <ToolButton icon={<span className="font-serif underline font-bold text-base">U</span>} label="Underline" command="underline" onClick={() => execCmd('underline')} underline isActive={activeFormats.underline} />
                <div className="w-px h-4 bg-stone-300 mx-1" />
                <ToolButton icon="Align L" label="Align Left" command="justifyLeft" onClick={() => execCmd('justifyLeft')} isActive={activeFormats.justifyLeft} />
                <ToolButton icon="Align C" label="Align Center" command="justifyCenter" onClick={() => execCmd('justifyCenter')} isActive={activeFormats.justifyCenter} />
                <ToolButton icon="Align R" label="Align Right" command="justifyRight" onClick={() => execCmd('justifyRight')} isActive={activeFormats.justifyRight} />
                <div className="w-px h-4 bg-stone-300 mx-1" />
                <ToolButton icon={<span className="font-serif text-base">H1</span>} label="Heading 1" command="formatBlock" onClick={() => execCmd('formatBlock', '<h1>')} isActive={activeFormats.block === 'h1'} />
                <ToolButton icon={<span className="font-serif text-base">H2</span>} label="Heading 2" command="formatBlock" onClick={() => execCmd('formatBlock', '<h2>')} isActive={activeFormats.block === 'h2'} />
                <ToolButton icon={<span className="font-serif text-base">P</span>} label="Paragraph" command="formatBlock" onClick={() => execCmd('formatBlock', '<p>')} isActive={activeFormats.block === 'p' || activeFormats.block === 'div' || !activeFormats.block} />
                <div className="w-px h-4 bg-stone-300 mx-1" />
                <ToolButton icon="•" label="Bullet List" command="insertUnorderedList" onClick={() => execCmd('insertUnorderedList')} isActive={activeFormats.insertUnorderedList} />
                <ToolButton icon="1." label="Numbered List" command="insertOrderedList" onClick={() => execCmd('insertOrderedList')} isActive={activeFormats.insertOrderedList} />
                <div className="w-px h-4 bg-stone-300 mx-1" />
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        insertField();
                    }}
                    className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-sm font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                    title="Insert a variable field"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Field
                </button>
            </div>

            {/* Editor Area */}
            <EditorArea 
                editorRef={editorRef}
                initialContent={initialContent}
                onInput={handleInput}
                checkFormats={checkFormats}
            />
        </div>
    );
}

const EditorArea = React.memo(({ 
    editorRef, 
    initialContent, 
    onInput, 
    checkFormats 
}: { 
    editorRef: React.RefObject<HTMLDivElement | null>, 
    initialContent: string, 
    onInput: () => void, 
    checkFormats: () => void 
}) => {
    return (
        <div
            ref={editorRef}
            className="flex-1 p-6 overflow-y-auto focus:outline-none prose prose-stone max-w-none"
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            onKeyUp={checkFormats}
            onMouseUp={checkFormats}
            dangerouslySetInnerHTML={{ __html: initialContent }}
            style={{ minHeight: '300px' }}
        />
    );
});

function ToolButton({ icon, label, onClick, bold, italic, underline, isActive }: any) {
    return (
        <button
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus from editor
                onClick();
            }}
            title={label}
            className={`
                p-1.5 min-w-[32px] rounded transition-colors font-medium text-sm flex items-center justify-center flex-shrink-0
                ${bold ? 'font-bold' : ''} 
                ${italic ? 'italic' : ''}
                ${underline ? 'underline' : ''}
                ${isActive ? 'bg-stone-300 text-stone-900 shadow-inner' : 'hover:bg-stone-200 text-stone-700'}
            `}
        >
            {icon === 'Align L' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg> :
             icon === 'Align C' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg> :
             icon === 'Align R' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg> :
             icon === 'Undo' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg> :
             icon === 'Redo' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg> :
             icon}
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
