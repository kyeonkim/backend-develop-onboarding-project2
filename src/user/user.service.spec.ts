import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './domain/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'password123',
      nickname: 'testnickname',
    };

    it('사용자가 정상적으로 생성되어야 한다', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null); // No user exists
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...createUserDto,
        password: 'hashedPassword',
        role: 'ROLE_USER',
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...createUserDto,
        password: 'hashedPassword',
        role: 'ROLE_USER',
      } as User);
      const result = await service.createUser(createUserDto);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: createUserDto.username },
          { nickname: createUserDto.nickname },
        ],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: createUserDto.username,
        password: 'hashedPassword',
        nickname: createUserDto.nickname,
        role: 'ROLE_USER',
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        username: createUserDto.username,
        password: 'hashedPassword',
        nickname: createUserDto.nickname,
        role: 'ROLE_USER',
      });
    });

    it('중복된 닉네임이 있을 경우 ConflictException을 던져야 한다', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        username: 'differentUsername',
        nickname: 'testnickname',
      } as User);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: createUserDto.username },
          { nickname: createUserDto.nickname },
        ],
      });
    });
  });
});
