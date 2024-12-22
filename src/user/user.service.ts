import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './domain/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, nickname } = createUserDto;

    // Username 중복 체크
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { nickname }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.nickname === nickname) {
        throw new ConflictException('Nickname already exists');
      }
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      nickname,
      role: 'ROLE_USER',
    });

    return this.userRepository.save(user);
  }
}
