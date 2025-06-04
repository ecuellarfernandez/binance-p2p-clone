import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.model";
import { Repository } from "typeorm";
import { RegisterDto } from "../auth/dtos/register.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }
    create(user: RegisterDto): Promise<User> {
        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser);
    }
    getUserById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    findAll() {
        return this.usersRepository.find();
    }

    async updateRole(id: string, role: string) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException("User not found");
        user.role = role;
        return this.usersRepository.save(user);
    }
}
