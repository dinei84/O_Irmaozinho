import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente de formulário para dados do cliente
 * Puxa dados do usuário logado quando disponível
 */
const CustomerDataForm = ({ value, onChange, errors = {} }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState(value || {
        name: '',
        email: '',
        phone: '',
        document: '' // CPF/CNPJ
    });

    // Preencher com dados do usuário logado quando disponível
    useEffect(() => {
        if (currentUser && !value) {
            const newFormData = {
                name: currentUser.displayName || '',
                email: currentUser.email || '',
                phone: '',
                document: ''
            };
            setFormData(newFormData);
            onChange(newFormData);
        }
    }, [currentUser]);

    // Atualizar formData quando value mudar externamente
    useEffect(() => {
        if (value) {
            setFormData(value);
        }
    }, [value]);

    // Formatar CPF/CNPJ
    const formatDocument = (doc) => {
        doc = doc.replace(/\D/g, '');
        
        if (doc.length <= 11) {
            // CPF: 000.000.000-00
            doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
            doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
            doc = doc.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ: 00.000.000/0000-00
            doc = doc.replace(/^(\d{2})(\d)/, '$1.$2');
            doc = doc.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            doc = doc.replace(/\.(\d{3})(\d)/, '.$1/$2');
            doc = doc.replace(/(\d{4})(\d)/, '$1-$2');
        }
        
        return doc;
    };

    // Formatar telefone
    const formatPhone = (phone) => {
        phone = phone.replace(/\D/g, '');
        if (phone.length <= 10) {
            phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
            phone = phone.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
            phone = phone.replace(/(\d{5})(\d)/, '$1-$2');
        }
        return phone;
    };

    const handleChange = (field, value) => {
        let formattedValue = value;
        
        if (field === 'document') {
            formattedValue = formatDocument(value);
            if (formattedValue.replace(/\D/g, '').length > 14) {
                return; // Limitar tamanho
            }
        } else if (field === 'phone') {
            formattedValue = formatPhone(value);
            if (formattedValue.replace(/\D/g, '').length > 11) {
                return; // Limitar tamanho
            }
        }
        
        const newFormData = { ...formData, [field]: formattedValue };
        setFormData(newFormData);
        onChange(newFormData);
    };

    return (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <User className="text-primary" size={20} />
                    <h3 className="text-xl font-heading font-bold text-secondary">
                        Dados do Cliente
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Nome */}
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-secondary mb-2">
                            Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="customerName"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Seu nome completo"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.name ? 'border-red-500' : 'border-borda'
                            }`}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-secondary mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="customerEmail"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="seu@email.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.email ? 'border-red-500' : 'border-borda'
                            }`}
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-secondary mb-2">
                            Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="customerPhone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="(11) 99999-9999"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.phone ? 'border-red-500' : 'border-borda'
                            }`}
                            required
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    {/* CPF/CNPJ */}
                    <div>
                        <label htmlFor="customerDocument" className="block text-sm font-medium text-secondary mb-2">
                            CPF/CNPJ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="customerDocument"
                            value={formData.document}
                            onChange={(e) => handleChange('document', e.target.value)}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.document ? 'border-red-500' : 'border-borda'
                            }`}
                            required
                        />
                        {errors.document && (
                            <p className="mt-1 text-sm text-red-500">{errors.document}</p>
                        )}
                        <p className="mt-1 text-xs text-text-secondary">
                            Necessário para emissão de nota fiscal
                        </p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default CustomerDataForm;
