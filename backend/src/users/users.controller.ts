import { Controller, Get, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@UseGuards(AuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Roles("admin")
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Roles("admin")
    @Patch(":id/role")
    updateRole(@Param("id") id: string, @Body("role") role: string) {
        return this.usersService.updateRole(id, role);
    }
}
