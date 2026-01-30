import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

/**
 * Componente de formulário para endereço de entrega
 * Inclui integração com ViaCEP para preenchimento automático
 */
const ShippingAddressForm = ({ value, onChange, errors = {} }) => {
    const [loadingCep, setLoadingCep] = useState(false);
    const [formData, setFormData] = useState(value || {
        street: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil'
    });

    // Atualizar formData quando value mudar externamente
    useEffect(() => {
        if (value) {
            setFormData(value);
        }
    }, [value]);

    // Buscar endereço pelo CEP usando ViaCEP
    const handleCepBlur = async () => {
        const cep = formData.zipCode.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            return;
        }

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                const newFormData = {
                    ...formData,
                    street: data.logradouro || '',
                    neighborhood: data.bairro || '',
                    city: data.localidade || '',
                    state: data.uf || ''
                };
                setFormData(newFormData);
                onChange(newFormData);
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setLoadingCep(false);
        }
    };

    // Formatar CEP
    const handleCepChange = (e) => {
        let cep = e.target.value.replace(/\D/g, '');
        if (cep.length > 8) cep = cep.slice(0, 8);
        if (cep.length > 5) {
            cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        
        const newFormData = { ...formData, zipCode: cep };
        setFormData(newFormData);
        onChange(newFormData);
    };

    const handleChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        onChange(newFormData);
    };

    return (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <MapPin className="text-primary" size={20} />
                    <h3 className="text-xl font-heading font-bold text-secondary">
                        Endereço de Entrega
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* CEP */}
                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-secondary mb-2">
                            CEP <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="zipCode"
                                value={formData.zipCode}
                                onChange={handleCepChange}
                                onBlur={handleCepBlur}
                                placeholder="00000-000"
                                maxLength={9}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {loadingCep && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                </div>
                            )}
                        </div>
                        {errors.zipCode && (
                            <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                        )}
                    </div>

                    {/* Rua */}
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-secondary mb-2">
                            Rua <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="street"
                            value={formData.street}
                            onChange={(e) => handleChange('street', e.target.value)}
                            placeholder="Nome da rua"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.street ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.street && (
                            <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Número */}
                        <div>
                            <label htmlFor="number" className="block text-sm font-medium text-secondary mb-2">
                                Número <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="number"
                                value={formData.number || ''}
                                onChange={(e) => handleChange('number', e.target.value)}
                                placeholder="123"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.number ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.number && (
                                <p className="mt-1 text-sm text-red-500">{errors.number}</p>
                            )}
                        </div>

                        {/* Complemento */}
                        <div className="md:col-span-2">
                            <label htmlFor="complement" className="block text-sm font-medium text-secondary mb-2">
                                Complemento
                            </label>
                            <input
                                type="text"
                                id="complement"
                                value={formData.complement}
                                onChange={(e) => handleChange('complement', e.target.value)}
                                placeholder="Apto, Bloco, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Bairro */}
                    <div>
                        <label htmlFor="neighborhood" className="block text-sm font-medium text-secondary mb-2">
                            Bairro <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="neighborhood"
                            value={formData.neighborhood}
                            onChange={(e) => handleChange('neighborhood', e.target.value)}
                            placeholder="Nome do bairro"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.neighborhood ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.neighborhood && (
                            <p className="mt-1 text-sm text-red-500">{errors.neighborhood}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cidade */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-secondary mb-2">
                                Cidade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                placeholder="Nome da cidade"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                            )}
                        </div>

                        {/* Estado */}
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-secondary mb-2">
                                Estado <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="state"
                                value={formData.state}
                                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                                placeholder="SP"
                                maxLength={2}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.state ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default ShippingAddressForm;
