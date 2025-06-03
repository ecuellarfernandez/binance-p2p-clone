import { AuthGuard } from "./auth.guard";

import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";

describe("AuthGuard", () => {
    it("should be defined", () => {
        const mockJwtService = {} as JwtService;
        const mockUsersService = {} as UsersService;
        expect(new AuthGuard(mockJwtService, mockUsersService)).toBeDefined();
    });
});
