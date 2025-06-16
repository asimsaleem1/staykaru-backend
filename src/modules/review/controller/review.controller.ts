import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';

@ApiTags('reviews')
@Controller('reviews')
// @UseGuards(AuthGuard) // Temporarily disabled for testing
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review successfully created' })
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    // For testing without authentication, use a dummy user ID
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    return this.reviewService.create(createReviewDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Return all reviews' })
  async findAll() {
    return this.reviewService.findAll();
  }

  @Get('target')
  @ApiOperation({ summary: 'Get reviews by target' })
  @ApiResponse({ status: 200, description: 'Return target reviews' })
  async findByTarget(
    @Query('type') targetType: string,
    @Query('id') targetId: string,
  ) {
    return this.reviewService.findByTarget(targetType, targetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by id' })
  @ApiResponse({ status: 200, description: 'Return a review' })
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review successfully updated' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    // For testing without authentication, use a dummy user ID
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    return this.reviewService.update(id, updateReviewDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review successfully deleted' })
  async remove(@Param('id') id: string, @Request() req) {
    // For testing without authentication, use a dummy user ID
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    await this.reviewService.remove(id, userId);
    return { message: 'Review deleted successfully' };
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify a review' })
  @ApiResponse({ status: 200, description: 'Review successfully verified' })
  async verifyReview(@Param('id') id: string) {
    return this.reviewService.verifyReview(id);
  }
}
