import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from "@nestjs/common";
import { CoinsService } from "./coins.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateCoinDto } from "./dto/create-coin.dto";
import { UpdateCoinDto } from "./dto/update-coin.dto";
import { RolesGuard } from "src/auth/roles.guard";
import { Roles } from "src/auth/roles.decorator";

@UseGuards(AuthGuard, RolesGuard)
@Controller("coins")
export class CoinsController {
    constructor(private coinsService: CoinsService) {}

    @Get()
    findAll() {
        return this.coinsService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.coinsService.findOne(String(id));
    }

    @Post()
    @Roles("admin")
    create(@Body() body: CreateCoinDto) {
        return this.coinsService.create(body);
    }

    @Put(":id")
    @Roles("admin")
    update(@Param("id") id: string, @Body() body: UpdateCoinDto) {
        return this.coinsService.update(String(id), body);
    }

    @Delete(":id")
    @Roles("admin")
    remove(@Param("id") id: string) {
        return this.coinsService.remove(String(id));
    }
}
