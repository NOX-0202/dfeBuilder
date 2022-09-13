class XMLBuilder {

    product_total = 0;
    total = 0;
    total_trib = 0;


    constructor(debug = true, contingency = false) {
        this.homolog = debug ? 2 : 1;
        this.contingency = contingency;
        return this;
    }


    buildHeader(data) {
        let ide = `<ide>`;
        ide += `<cUF>${data.state_code}</cUF>`;
        ide += `<cNF>${data.dfe_code ?? data.dfe_number + 1}</cNF>`;
        ide += `<natOp>${data.operation}</natOp>`;
        ide += `<mod>${data.dfe_mode}</mod>`;
        ide += `<serie>${data.dfe_serie}</serie>`;
        ide += `<nNF>${data.dfe_number}</nNF>`;
        ide += `<dhEmi>${data.emission_datetime ?? date("Y-m-d H:i:s").replace(" ", "T")}-03:00</dhEmi>`;
        ide += `<tpNF>${data.dfe_type}</tpNF>`;
        ide += `<idDest>${data.id_dest}</idDest>`;
        ide += `<cMunFG>${data.city_code}</cMunFG>`;
        ide += `<tpImp>${data.impression_type ?? 4}</tpImp>`;
        ide += `<tpEmis>${data.emission_type ?? 1}</tpEmis>`;
        ide += `<cDV>${data.verify_code}</cDV>`;
        ide += `<tpAmb>${data.environment ?? this.homolog}</tpAmb>`;
        ide += `<finNFe>${data.dfe_finality}</finNFe>`;
        ide += `<indFinal>${data.operation_with_customer}</indFinal>`;
        ide += `<indPres>${data.operation_mode}</indPres>`;
        ide += `<procEmi>${data.emission_process}</procEmi>`;
        ide += `<verProc>${data.application ?? "MINIPDV 1.0"}</verProc>`;


        if (data.contingency) {
            ide += `<dhCont>${data.contingency.datetime}</dhCont>`;
            ide += `<xJust>${data.contingency.reason}</xJust>`;
        }

        ide += `</ide>`;

        return ide;
    }

    buildEmitter(data) {
        let emitter = `<emit>`;
        emitter += `<CNPJ>${data.document}</CNPJ>`;
        emitter += `<xNome>${data.name}</xNome>`;
        emitter += `<xFant>${data.fancy_name}</xFant>`;
        emitter += `<enderEmit>`;
        emitter += `<xLgr>${data.address.street_name}</xLgr>`;
        emitter += `<nro>${data.address.number}</nro>`;
        emitter += `<xCpl>${data.address.info}</xCpl>`;
        emitter += `<xBairro>${data.address.neighborhood}</xBairro>`;
        emitter += `<cMun>${data.address.city_code}</cMun>`;
        emitter += `<xMun>${data.address.city}</xMun>`;
        emitter += `<UF>${data.address.state}</UF>`;
        emitter += `<CEP>${data.address.zip_code}</CEP>`;
        emitter += `<cPais>${data.address.country_code ?? "1058"}</cPais>`;
        emitter += `<xPais>${data.address.country ?? "BRASIL"}</xPais>`;
        emitter += `<fone>${data.phone}</fone>`;
        emitter += `</enderEmit>`;
        emitter += `<IE>${data.ie}</IE>`;
        emitter += `<CRT>${data.crt}</CRT>`;
        emitter += `</emit>`;
        return emitter;
    }

    buildReceiver(data) {
        let receiver = `<dest>`;
        receiver += (data.document.length > 11) ? `<CNPJ>${data.document}</CNPJ>` : `<CPF>${data.document}</CPF>`;
        if (data.name) {
            receiver += `<xNome>${data.name}</xNome>`;
            receiver += `<indIEDest>${data.ie_type}</indIEDest>`;
        }
        if (data.address) {
            receiver += `<enderDest>`;
            receiver += `<xLgr>${data.address.street_name}</xLgr>`;
            receiver += `<nro>${data.address.number}</nro>`;
            receiver += `<xCpl>${data.address.info}</xCpl>`;
            receiver += `<xBairro>${data.address.neighborhood}</xBairro>`;
            receiver += `<cMun>${data.address.city_code}</cMun>`;
            receiver += `<xMun>${data.address.city}</xMun>`;
            receiver += `<UF>${data.address.state}</UF>`;
            receiver += `<CEP>${data.address.zip_code}</CEP>`;
            receiver += `<cPais>${data.address.country_code ?? "1058"}</cPais>`;
            receiver += `<xPais>${data.address.country ?? "BRASIL"}</xPais>`;
            receiver += `<fone>${data.phone}</fone>`;
            receiver += `</enderDest>`;
            receiver += `<IE>${data.ie}</IE>`;
        }
        receiver += `</dest>`;
        return receiver;
    }

    buildProducts(products) {
        let products_xml = '';
        products.map((product, index) => {
            products_xml += `<det nItem = "${index + 1}" >`
            products_xml += this.buildProduct(product);
            products_xml += this.buildTaxes({ total: product.vTotTrib });
            products_xml += this.buildICMS(product.icms);
            products_xml += `</det>`;

            if (product.total_indicator === 1) {
                this.product_total += product.value
                this.total += parseFloat(product.value) + parseFloat(product.vTotTrib);
                this.total_trib += parseFloat(product.vTotTrib);
            }
        });
        return products_xml;
    }

    buildProduct(product) {

        let product_xml = `<prod>`;
        product_xml += `<cProd>${product.code}</cProd>`;
        product_xml += `<cEAN>${product.ean}</cEAN>`;
        product_xml += `<xProd>${product.name}</xProd>`;
        product_xml += `<NCM>${product.ncm}</NCM>`;
        product_xml += `<CFOP>${product.cfop}</CFOP>`;
        product_xml += `<uCom>${product.unit}</uCom>`;
        product_xml += `<qCom>${product.amount}</qCom>`;
        product_xml += `<vUnCom>${product.unit_value}</vUnCom>`;
        product_xml += `<vProd>${product.value}</vProd>`;
        product_xml += `<cEANTrib>${product.ean_trib}</cEANTrib>`;
        product_xml += `<uTrib>${product.unit_trib}</uTrib>`;
        product_xml += `<qTrib>${product.amount_trib}</qTrib>`;
        product_xml += `<vUnTrib>${product.unit_value_trib}</vUnTrib>`;
        product_xml += `<indTot>${product.total_indicator}</indTot>`;
        product_xml += `</prod>`;

        return product_xml;
    }

    buildTaxes(taxes) {
        return `<imposto><vTotTrib>${taxes.total ?? 0.00}</vTotTrib></imposto>`;
    }

    buildICMS(imcs) {
        let icms = '<ICMS>';
        icms += `<ICMSSN${imcs.csosn}>`;
        icms += `<orig>0</orig>`;
        icms += `<CSOSN>${imcs.csosn}</CSOSN>`;
        switch (imcs.csosn) {
            case '101':
                icms += `<pCredSN>${icms.applicable_aliquot_of_credit_calculation ?? "0"}</pCredSN>`;
                icms += `<vCredICMSSN>${icms.credit_value ?? "0"}</vCredICMSSN>`;
                break;
            case '201':
                icms += `<modBCST>${icms.calculation_basis_type ?? "0"}</modBCST>`;
                icms += `<pMVAST>${icms.margin_value ?? "0"}</pMVAST>`;
                icms += `<pRedBCST>${icms.calculation_basis_reduction ?? "0"}</pRedBCST>`;
                icms += `<vBCST>${icms.calculation_basis_value ?? "0"}</vBCST>`;
                icms += `<pICMSST>${icms.aliquot_tax ?? "0"}</pICMSST>`;
                icms += `<vICMSST>${icms.value ?? "0"}</vICMSST>`;
                icms += `<pCredSN>${icms.applicable_aliquot_of_credit_calculation ?? "0"}</pCredSN>`;
                icms += `<vCredICMSSN>${icms.credit_value ?? "0"}</vCredICMSSN>`;
                break;
            case '202', '203':
                icms += `<modBCST>${icms.calculation_basis_type ?? "0"}</modBCST>`;
                icms += `<pMVAST>${icms.margin_value ?? "0"}</pMVAST>`;
                icms += `<pRedBCST>${icms.calculation_basis_reduction ?? "0"}</pRedBCST>`;
                icms += `<vBCST>${icms.calculation_basis_value ?? "0"}</vBCST>`;
                icms += `<pICMSST>${icms.aliquot_tax ?? "0"}</pICMSST>`;
                icms += `<vICMSST>${icms.value ?? "0"}</vICMSST>`;
                break;
            case '500':
                icms += `<vBCSTRet>${icms.calculation_basis_value ?? "0"}</vBCSTRet>`;
                icms += `<pST> ${icms.customer_aliquot ?? "0"}</pST> `;
                icms += `<vICMSSTRet> ${icms.value ?? "0"}</vICMSSTRet> `;
                break;
            case '900':
                icms += `<modBC> ${icms.bc_type ?? "0"}</modBC>`;
                icms += `<pRedBC>${icms.calculation_basis_reduction ?? "0"}</pRedBC>`;
                icms += `<vBC>${icms.calculation_basis_value ?? "0"}</vBC>`;
                icms += `<pICMS>${icms.percentage ?? "0"}</pICMS>`;
                icms += `<vICMS>${icms.value ?? "0"}</vICMS>`;
                icms += `<modBCST>${icms.calculation_basis_type ?? "0"}</modBCST>`;
                icms += `<pMVAST>${icms.margin_value ?? "0"}</pMVAST>`;
                icms += `<pRedBCST>${icms.calculation_basis_reduction ?? "0"}</pRedBCST>`;
                icms += `<vBCST>${icms.calculation_basis_value ?? "0"}</vBCST>`;
                icms += `<pICMSST>${icms.aliquot_tax ?? "0"}</pICMSST>`;
                icms += `<vICMSST>${icms.value ?? "0"}</vICMSST>`;
                icms += `<pCredSN>${icms.applicable_aliquot_of_credit_calculation ?? "0"}</pCredSN>`;
                icms += `<vCredICMSSN>${icms.credit_value ?? "0"}</vCredICMSSN>`;
                break;

        }
        icms += `</ICMSSN${imcs.csosn}>`;
        icms += `</ICMS>`;

        return icms;
    }

    buildTotal(data) {

        let total = `<total>`;
        total += `<ICMSTot>`;
        total += `<vBC>${data.base_calculation_value ?? "0.00"}</vBC>`;
        total += `<vICMS>${data.value ?? "0.00"}</vICMS>`;
        total += `<vICMSDeson>${data.desoneration_value ?? "0.00"}</vICMSDeson>`;
        total += `<vFCP>${data.poverty_fund ?? "0.00"}</vFCP>`;
        total += `<vBCST>${data.icms_base_calculation_value ?? "0.00"}</vBCST>`;
        total += `<vST>${data.vST ?? "0.00"}</vST>`;
        total += `<vFCPST>${data.vFCPST ?? "0.00"}</vFCPST>`;
        total += `<vFCPSTRet>${data.vFCPSTRet ?? "0.00"}</vFCPSTRet>`;
        total += `<vProd>${data.vProd ?? this.product_total}</vProd>`;
        total += `<vFrete>${data.shipping_value ?? "0.00"}</vFrete>`;
        total += `<vSeg>${data.vSeg ?? "0.00"}</vSeg>`;
        total += `<vDesc>${data.vDesc ?? "0.00"}</vDesc>`;
        total += `<vII>${data.vII ?? "0.00"}</vII>`;
        total += `<vIPI>${data.vIPI ?? "0.00"}</vIPI>`;
        total += `<vIPIDevol>${data.vIPIDevol ?? "0.00"}</vIPIDevol>`;
        total += `<vPIS>${data.vPIS ?? "0.00"}</vPIS>`;
        total += `<vCOFINS>${data.vCOFINS ?? "0.00"}</vCOFINS>`;
        total += `<vOutro>${data.vOutro ?? "0.00"}</vOutro>`;
        total += `<vNF>${data.dfe_value ?? this.total}</vNF>`;
        total += `<vTotTrib>${data.dfe_tribute_value ?? this.total_trib}</vTotTrib>`;
        total += `</ICMSTot></total>`;

        return total;
    }

    buildTransport(data) {
        return `<transp><modFrete>${data.mode ?? "0"}</modFrete></transp>`;
    }

    buildPayment(payments) {
        let total_paid = 0;
        let payment_xml = `<pag>`;
        payments.forEach(payment => {

            payment_xml += `<detPag>`;
            payment_xml += `<tPag>${payment.code ?? "0"}</tPag>`;
            payment_xml += `<vPag>${payment.value ?? "0.00"}</vPag>`;


            if (payment.card) {
                payment_xml += `<card>`;
                if (payment.card.integration) payment_xml += `<tpIntegra>${payment.integration ?? "0.00"}</tpIntegra>`;
                if (payment.card.company_document) payment_xml += `<CNPJ>${payment.company_document ?? "0.00"}</CNPJ>`;
                if (payment.card.brand) payment_xml += `<tBand>${payment.brand ?? "0.00"}</tBand>`;
                if (payment.card.autorization_code) payment_xml += `<cAut>${payment.autorization_code ?? "0.00"}</cAut>`;
                payment_xml += `</card>`;
            }

            payment_xml += `</detPag>`;
            total_paid += parseFloat(payment.value);
        });
        payment_xml += `<vTroco>${parseFloat(Math.abs(total_paid - this.total)).toFixed(2) ?? "0.00"}</vTroco>`;
        payment_xml += `</pag>`;

        return payment_xml;
    }

    buildResponsavelTecnico() {
        let responsavelTecnico = `<infRespTec>`;
        responsavelTecnico += `<CNPJ>25228224000186</CNPJ>`;
        responsavelTecnico += `<xContato>Fernando</xContato>`;
        responsavelTecnico += `<email>dev@linkinformatica.com.br</email>`;
        responsavelTecnico += `<fone>21997895329</fone>`;
        responsavelTecnico += `</infRespTec>`;

        return responsavelTecnico;
    }

    async build(data, options = {}) {

        let unsigned_xml = `<?xml version="1.0" encoding="UTF-8" ?>`;

        unsigned_xml += `<xmlns="http://www.portalfiscal.inf.br/nfe">`;
        unsigned_xml += `<infNFe Id="${data.info.key}" versao="${data.info.version ?? '4.00'}" >`;
        unsigned_xml += this.buildHeader(data.header, data);
        unsigned_xml += this.buildEmitter(data.emitter);
        if (data.receiver) unsigned_xml += this.buildReceiver(data.receiver);
        unsigned_xml += this.buildProducts(data.products);
        unsigned_xml += this.buildTotal(data.icmstot ?? {});
        unsigned_xml += this.buildTransport(data.shipping);
        unsigned_xml += this.buildPayment(data.payments);
        unsigned_xml += `<infAdic />`;
        unsigned_xml += this.buildResponsavelTecnico();
        unsigned_xml += `</infNFe>`;
        unsigned_xml += `<Signature />`;
        unsigned_xml += `</NFe>`;

        if (options.sign) {
            let signature = await this.sign(unsigned_xml);
            unsigned_xml = unsigned_xml.replace('<Signature />', signature);
        } else {
            unsigned_xml = unsigned_xml.replace('<Signature />', '');
        }



        return {
            json: data,
            xml: unsigned_xml
        };

    }
}

export default XMLBuilder;