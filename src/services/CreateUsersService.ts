import { getRepository } from 'typeorm';
import User from '../models/User';
import AppError from '../errors/AppError';
import { hash } from 'bcryptjs';
import UsersRepository from 'src/repositories/UsersRepository';

interface Request {
  name: string;
  email: string;
  password: string;
  phone: string;
  addressId: string;
  born: Date;
}




class CreateUserService {
  public async execute({name, email, phone, password, addressId, born }: Request): Promise<User> {
    const userRepository = getRepository(User);

    const usernameHash = await hash(name,4);

    const userName = name + usernameHash;

    const checkUser = await userRepository.findOne({
      where: {email}
    });

    if (checkUser) {
      throw new AppError('User email already exists', 400);
    }

    if( !born ){
      throw new AppError('data de nascimento inválida');
    }

    const hashedPassword = await hash(password, 8);


    const user = userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address_id: addressId,
      username: userName,
      followers_amount: 0,
      following_amount: 0,
      born,
    });
    await userRepository.save(user);

    // @ts-expect-error Aqui vai ocorrer um erro, mas estou ignorando
    delete(user.password);

    return user;

  }
}

export default CreateUserService;
