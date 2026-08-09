import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminUserDocument } from './schemas/admin-user.schema';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Ensures the admin account from ADMIN_EMAIL/ADMIN_PASSWORD env vars exists,
   * so there is no separate manual seeding step for the single-event admin.
   */
  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap',
      );
      return;
    }

    const existing = await this.adminUserModel
      .findOne({ email: email.toLowerCase() })
      .exec();
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 10);
    await this.adminUserModel.create({
      email: email.toLowerCase(),
      passwordHash,
    });
    this.logger.log(`Bootstrapped admin account for ${email}`);
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.adminUserModel
      .findOne({ email: dto.email.toLowerCase() })
      .exec();
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwtService.signAsync({
      sub: admin._id.toString(),
      email: admin.email,
    });
    return { accessToken };
  }
}
