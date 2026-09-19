import { Module } from '@nestjs/common';
import { MembershipModule } from '../membership/membership.module';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [MembershipModule],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
