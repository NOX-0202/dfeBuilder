import XMLBuilder from './XMLBuilder.js';
import { extractInt, verifyTpIntrega } from './libs/utils.js';

class DfeBuilder {
    constructor(homolog = true) {
        this.homolog = homolog ? '2' : '1';
        this.obj = {};
        return this;
    }

    getJson() {
        return this.dfe_formatted.json;
    }

    getXml() {
        return this.dfe_formatted.xml;
    }

    getAll() {
        return this.dfe_formatted;
    }

    generateDfeKey(company, header) {

        let chave = '';
        let ano = header.emission_datetime.substring(2, 4);
        let mes = header.emission_datetime.substring(5, 7);

        const serie = `${parseInt(header.dfe_serie)}`;
        const numero = `${parseInt(header.dfe_number)}`;

        chave += (header.state_code.toString().padStart(2, '0'));
        chave += (ano + mes);
        chave += (company.document.padStart(14, '0'));
        chave += (header.dfe_mode.toString().padStart(2, '0'));
        chave += (serie.padStart(3, '0'));
        chave += (numero.padStart(9, '0'));
        chave += (header.emission_type);
        let cnf = `${parseInt(header.dfe_number) + 1}`.padStart(8, '0');
        chave += cnf;
        let digitoVerificador = this.obterDigitoVerificador(chave);
        chave += digitoVerificador;
        return {
            dfe_number: header.dfe_number,
            chave: chave,
            cnf: cnf,
            dv: digitoVerificador
        };
    }

    obterDigitoVerificador(chave) {
        let soma = 0;
        let mod = -1;
        let dv = -1;
        let peso = 2;
        let chaveArr = chave.split('');
        for (let i = chaveArr.length - 1; i !== -1; i--) {
            let ch = Number(chaveArr[i].toString());
            soma += ch * peso;
            if (peso < 9)
                peso += 1;
            else
                peso = 2;
        }
        mod = soma % 11;
        if (mod === 0 || mod === 1)
            dv = 0;
        else
            dv = 11 - mod;
        return dv.toString();
    }

    async validate(required, data, tag) {
        if (!data && typeof data) throw new Error('Voce deve passar um array para validar');

        const errs = [];
        for (const key in required) {
            const required_options = required[key];

            if (required_options.default) data[key] = data[key] || required_options.default;
            if (required_options.required && (!data[key] || data[key].length == 0)) errs.push(`\t${key} é obrigatório`);
            if (required_options.unique_treatment) data[key] = required_options.unique_treatment(data[key]);

            switch (required_options.type) {
                case 'object':
                    if (typeof data[key] !== 'object') errs.push(`\t${key} deve ser um objeto`);
                    await this.validate(required_options.required_values, data[key], `${tag} => ${key}`);
                    break;
                case 'int':
                    if (!(data[key] = parseInt(data[key]))) errs.push(`\t${key} deve ser um inteiro`);
                    break;
                case 'number':
                    if (!(data[key] = parseFloat(data[key]))) errs.push(`\t${key} deve ser um número`);
                    break;
                case 'date':
                    if (!(data[key] = new Date(data[key]))) errs.push(`\t${key} deve ser uma data`);
                    else {
                        let formatted_date = data[key].toLocaleString().split('.')[0]
                        formatted_date = formatted_date.split(' ')
                        data[key] = formatted_date[0].split('/').reverse().join('-') + 'T' + formatted_date[1] + '-03:00'
                    }
                    break;
                case 'string':
                    if (!(data[key] = data[key].toString())) errs.push(`\t${key} deve ser uma string`)
                    break;
            }

            if (required.values && !required_options.values.includes(data[key])) errs.push(`\t${key} deve ser um dos valores ${required_options.values.join(',')}`);

            if (required_options.min_length && data[key].length < required_options.min_length) errs.push(`\t${key} deve ter no mínimo ${required_options.min_length} caracteres`);
            if (required_options.max_length && data[key].length > required_options.max_length) errs.push(`\t${key} deve ter no máximo ${required_options.max_length} caracteres`);

        }

        if (errs.length > 0) throw new Error(`Erros na tag ${tag}: \n ${errs.join(', \n')}`);
        else {
            if (!tag.includes('=>')) {
                if (tag.includes('[')) this.obj[tag.replace(/[\[][0-9][\]]/g, "")] = data;
                else this.obj[tag] = data;
            }
            return data

        };
    }

    async info(data) {

        const nfe_data = this.generateDfeKey(data.emitter, data.header);
        this.dfe_info = nfe_data;

        const required = {
            key: { type: 'string', required: true, default: "Nfe" + nfe_data.chave },
            version: { type: 'string', required: true, default: '4.00' },
        }

        return await this.validate(required, {
            key: data.key,
            version: data.version,
            environment: this.homolog,
        }, 'info');
    }

    async header(data) {
        const required = {
            state_code: {
                type: 'number', max_length: 2, required: true, unique_treatment: (state_code) => {
                    let treated = extractInt(state_code)
                    if (treated.length > 2) throw new Error('O código do estado deve ter 2 dígitos')
                    return treated;
                }
            },
            dfe_code: { type: 'int', required: true },
            operation: { type: 'string', required: true },
            dfe_mode: { type: 'number', required: true },
            dfe_serie: { type: 'int', required: true },
            dfe_number: { type: 'int', required: true },
            emission_datetime: { type: 'date', required: true },
            dfe_type: { type: 'number', required: true },
            verify_code: { type: 'string', required: true, default: this.dfe_info.dv },
            id_dest: { type: 'string', required: true },
            city_code: { type: 'string', required: true },
            impression_type: { type: 'int', required: true },
            emission_type: { type: 'int', required: true },
            dfe_finality: { type: 'string', required: true },
            operation_with_customer: { type: 'int', required: true },
            operation_mode: { type: 'int', required: true },
            emission_process: { type: 'string', required: true },
        }

        if (data.contingency) required.contingency = {
            type: 'object', required: false, required_values: {
                reason: { type: 'string', required: true },
                datetime: { type: 'date', required: true },
            }
        }


        return await this.validate(required, data, 'header');
    }

    async emitter(data) {
        const required = {
            document: { type: 'string', required: true },
            name: { type: 'string', required: true },
            fancy_name: { type: 'string', required: true },
            address: {
                type: 'object', required: true, required_values: {
                    street_name: { type: 'string', required: true },
                    number: { type: 'int', required: true },
                    info: { type: 'string', required: true },
                    neighborhood: { type: 'string', required: true },
                    city: { type: 'string', required: true },
                    city_code: { type: 'string', required: true },
                    state: { type: 'string', required: true },
                    zip_code: { type: 'string', required: true },
                }
            },
            phone: { type: 'string', required: true },
            ie: { type: 'string', required: true },
            im: { type: 'string', required: false },
            cnae: { type: 'string', required: false },
            crt: { type: 'string', required: true, default: 1 },
            idCSC: { type: 'string', required: true },
            CSC: { type: 'string', required: true },
        }

        return await this.validate(required, data, 'emitter');
    }

    async receiver(data) {
        const required = {
            document: { type: 'string', required: true },
            name: { type: 'string', required: false },
            indIEDest: { type: 'int', required: true, default: 9 },
        }

        return await this.validate(required, data, 'receiver');
    }

    async products(data) {

        const required = {
            code: { type: 'string', required: true },
            ean: { type: 'string', required: true },
            name: { type: 'string', required: true },
            ncm: { type: 'string', required: true },
            cfop: { type: 'string', required: true },
            unit: { type: 'string', required: true },
            amount: { type: 'float', required: true },
            unit_value: { type: 'float', required: true },
            value: { type: 'float', required: true },
            ean_trib: { type: 'string', required: true },
            unit_trib: { type: 'float', required: true },
            amount_trib: { type: 'float', required: true },
            unit_value_trib: { type: 'float', required: true },
            total_indicator: { type: 'string', required: true },
            vTotTrib: { type: 'float', required: true },
            icms: {
                type: 'object', required: true, required_values: {
                    csosn: { type: 'string', required: true },
                }
            },
        }

        const products_array = [];
        if (Array.isArray(data)) for (let i = 0; i < data.length; i++) {
            products_array.push(await this.validate(required, data[i], `products[${i}]`));
        } else {
            products_array.push(await this.validate(required, data, 'products'));
        }

        this.obj.products = products_array;
        return products_array;
    }

    async shipping(data) {

        const required = {
            mode: { type: 'int', required: true },
        }

        return await this.validate(required, data, 'shipping');
    }

    async payments(data) {

        const required = {
            code: { type: 'string', required: true },
            value: { type: 'float', required: true },
            tpIntegra: { type: 'string', required: false },
            tBand: { type: 'string', required: false },
        }


        const payments_array = [];
        if (Array.isArray(data)) for (let i = 0; i < data.length; i++) {
            const payment = data[i]
            if (verifyTpIntrega(payment.code)) {
                payment.tpIntegra = verifyTpIntrega(payment.code);
                payment.tBand = verifyTpIntrega(payment.code) ? 99 : null;
            }
            payments_array.push(await this.validate(required, payment, `payments[${i}]`));
        } else {
            if (verifyTpIntrega(data.code)) {
                data.tpIntegra = verifyTpIntrega(data.code);
                data.tBand = verifyTpIntrega(data.code) ? 99 : null;
            }
            payments_array.push(await this.validate(required, data, 'payments'));
        }

        this.obj.payments = payments_array;
        return payments_array;

    }

    async validateAll(data) {

        const required_tags = ['header', 'emitter', 'products', 'shipping', 'payments'];
        const received_tags = Object.keys(data);

        required_tags.forEach(tag => {
            if (!received_tags.includes(tag)) throw new Error(`Tag ${tag} é obrigatória`);
        });

        await this.info(data)
        await this.header(data.header);
        await this.emitter(data.emitter);
        await this.receiver(data.receiver);
        await this.products(data.products);
        await this.shipping(data.shipping);
        await this.payments(data.payments);
        return this;
    }

    async build(data = {}) {
        await this.validateAll(data);

        const builder = await new XMLBuilder(this.homolog, data.header.contingency ?? null).build(this.obj);
        this.dfe_formatted = builder;
        return this;
    }


}

export default DfeBuilder;