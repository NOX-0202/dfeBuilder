import DfeBuilder from "./src/DfeBuilder.js";
(async () => {
    try {
        const formatted_obj = {
            env: 2,
        }

        const header = {};
        header.state_code = '33';
        header.dfe_code = 2;
        header.dfe_number = 1;
        header.operation = "VENDA CONSUMIDOR";
        header.dfe_mode = 65;
        header.dfe_type = 1;
        header.dfe_serie = 2;
        header.emission_datetime = new Date().toISOString();
        header.id_dest = "1";
        header.city_code = '330100';
        header.dfe_finality = "1";
        header.operation_with_customer = "1";
        header.impression_type = 4
        header.operation_mode = "1";
        header.emission_process = "0";

        const contingency = true;
        header.emission_type = contingency ? "9" : "1";

        if (contingency) header.contingency = {
            reason: "Sem conexao com a internet ou Sefaz indisponivel",
            datetime: new Date().toISOString(),
        }

        formatted_obj.header = header;

        const emitter = {};

        emitter.document = '25228224000186';
        emitter.name = 'INFO LINK EQUIPAMENTOS E INFORMATICA LTDA';
        emitter.fancy_name = 'INFO LINK';
        emitter.address = {
            street_name: "R VISCONDE DE SANTA ISABEL",
            number: 20,
            info: "SALA 415",
            neighborhood: "VILA ISABEL",
            city_code: "330100",
            city: "RIO DE JANEIRO",
            state: "RJ",
            zip_code: 20560120,
        }
        emitter.phone = '21997895329';
        emitter.ie = '000000';
        emitter.im = '';
        emitter.cnae = '';
        emitter.crt = '';
        emitter.idCSC = 1;
        emitter.CSC = 'E51EF5E9-33D9-4FCC-A37C-CBB0B4DE5FBF' ?? "";

        formatted_obj.emitter = emitter;

        const receiver = {};
        receiver.document = '187.254.637-48';
        receiver.name = 'Fernando Oliveira';
        formatted_obj.receiver = receiver;

        formatted_obj.products = [
            {
                code: '1',
                ean: 'SEM GTIN',
                name: 'BLUSA AZUL',
                ncm: '62061000',
                cfop: '5102',
                unit: 'UN',
                amount: '1',
                unit_value: '5.00',
                value: '5.00',
                ean_trib: 'SEM GTIN',
                unit_trib: '5.00',
                amount_trib: '1',
                unit_value_trib: '5.00',
                total_indicator: 1,
                vTotTrib: '0',
                icms: {
                    csosn: '102',
                },
            },
        ];

        formatted_obj.shipping = {
            mode: 9,
        };

        formatted_obj.payments = [{
            code: '01',
            value: "10.00",
        }];



        const build = await new DfeBuilder().build(formatted_obj);


        if (false) console.log({
            json: build.getJson(),
            xml: build.getXml(),
            both: build.getAll(),
        });

        console.log(build.getJson())


    } catch (error) {
        // console.log(error)
        console.log(error.message);
    }

})();