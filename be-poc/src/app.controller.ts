import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FirestoreService } from './firestore/firestore.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firestoreService: FirestoreService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Ejemplos de endpoints para usar Firestore
  @Get('users')
  async getUsers(): Promise<Array<Record<string, unknown>>> {
    const users = await this.firestoreService.getCollection('users');
    return users;
  }

  @Get('users/:id')
  async getUser(
    @Param('id') id: string,
  ): Promise<Record<string, unknown> | null> {
    const user = await this.firestoreService.getDocument('users', id);
    return user;
  }

  @Post('users')
  async createUser(
    @Body() userData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const id: string = await this.firestoreService.createDocument(
      'users',
      userData,
    );
    return { id, ...userData };
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    await this.firestoreService.updateDocument('users', id, userData);
    return { id, ...userData };
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
  ): Promise<{ message: string; id: string }> {
    await this.firestoreService.deleteDocument('users', id);
    return { message: 'User deleted successfully', id };
  }
}
