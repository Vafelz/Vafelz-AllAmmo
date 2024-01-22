"use strict"
import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ITraderAssort, ITraderBase } from "@spt-aki/models/eft/common/tables/ITrader";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { Money } from "@spt-aki/models/enums/Money";
import { Traders } from "@spt-aki/models/enums/Traders";
import { IQuestConfig } from "@spt-aki/models/spt/config/IQuestConfig";
import { IRagfairConfig } from "@spt-aki/models/spt/config/IRagfairConfig";
import { RagfairPriceService } from "@spt-aki/services/RagfairPriceService";
import * as baseJson from "../db/base.json";
import * as assortJson from "../db/assort.json";

class VafelsTrader implements IPreAkiLoadMod, IPostDBLoadMod {
    mod: string;;
    logger: ILogger;
    private configServer: ConfigServer;
    // private ragfairConfig: IRagfairConfig;

    constructor() {
        this.mod = "VAFELZ-ALLAMMO";
    }

    public preAkiLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.logger.debug(`[${this.mod}] preAki Loading... `);

        const preAkiModLoader: PreAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const imageRouter: ImageRouter = container.resolve<ImageRouter>("ImageRouter");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig: ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);

        this.registerProfileImage(preAkiModLoader, imageRouter);
        this.setupTraderUpdateTime(traderConfig);
        Traders[baseJson._id] = baseJson._id;

        this.logger.debug(`[${this.mod}] preAki Loaded`);
    }

    public postAkiLoad(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
    }

    public postDBLoad(container: DependencyContainer): void {
        this.logger.debug(`[${this.mod}] postDb Loading...`);
        this.configServer = container.resolve("ConfigServer");
        // this.ragfairConfig = this.configServer.getConfig(ConfigTypes.RAGFAIR);

        const db: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const configServer: ConfigServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig: ITraderConfig = configServer.getConfig(ConfigTypes.TRADER);
        const jsonUtil: JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const tables = db.getTables();
        
        this.addTraderToDb(baseJson, tables, jsonUtil);
        this.addTraderToLocales(tables, baseJson.name, "VAFELZ", baseJson.nickname, baseJson.location, "OwO");
        // this.ragfairConfig.traders[baseJson._id] = true;

        this.logger.debug(`[${this.mod}] postDb Loaded`);
    }

    private registerProfileImage(preAkiModLoader: PreAkiModLoader, imageRouter: ImageRouter): void {
        const imageFilePath = `./${preAkiModLoader.getModPath(this.mod)}res`;
        imageRouter.addRoute(baseJson.avatar.replace(".jpg", ""), `${imageFilePath}/vafelz.jpg`);
    }

    private setupTraderUpdateTime(traderConfig: ITraderConfig): void {
        const traderRefreshRecord: UpdateTime = { traderId: baseJson._id, seconds: 3600 };
        traderConfig.updateTime.push(traderRefreshRecord);
    }

    private addTraderToDb(VAFELZ: any, tables: IDatabaseTables, jsonUtil: JsonUtil): void {
        tables.traders[VAFELZ._id] = {
            assort: jsonUtil.deserialize(jsonUtil.serialize(assortJson)) as ITraderAssort,
            base: jsonUtil.deserialize(jsonUtil.serialize(VAFELZ)) as ITraderBase
            questassort: {
                started: {},
                success: {},
                fail: {}
            }
        };
    }

    private addTraderToLocales(tables: IDatabaseTables, fullName: string, firstName: string, nickName: string, location: string, description: string) {
        const locales = Object.values(tables.locales.global) as Record<string,string>[];
        for (const locale of locales) {
            locale[`${baseJson._id} Fullname`] = fullName;
            locale[`${baseJson._id} FirstName`] = firstName;
            locale[`${baseJson._id} Nickname`] = nickName;
            locale[`${baseJson._id} Location`] = location;
            locale[`${baseJson._id} Description`] = description;
        }
    }

    private addItemToLocales(tables: IDatabaseTables, itemTpl: string, name: string, shortName: string, Description: string) {
        const locales = Object.values(tables.locales.global) as Record<string, string>[];
        for (const locale of locales) {
            locale[`${itemTpl} Name`] = name;
            locale[`${itemTpl} ShortName`] = shortName;
            locale[`${itemTpl} Description`] = Description;
        }
    }
}
module.exports = { mod: new VafelsTrader() }