import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getStatus', () => {
    it('should return status object', () => {
      const appController = app.get(AppController);
      const result = appController.getStatus();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
