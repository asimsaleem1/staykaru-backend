import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country } from '../schema/country.schema';
import { City } from '../schema/city.schema';
import { CreateCountryDto } from '../dto/create-country.dto';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { GoogleMapsAdapter } from '../adapters/google-maps.adapter';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<Country>,
    @InjectModel(City.name) private readonly cityModel: Model<City>,
    private readonly googleMapsAdapter: GoogleMapsAdapter,
  ) {}

  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    const country = new this.countryModel(createCountryDto);
    return country.save();
  }

  async getAllCountries(): Promise<Country[]> {
    return this.countryModel.find().exec();
  }

  async getCountryById(id: string): Promise<Country> {
    const country = await this.countryModel.findById(id).exec();
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return country;
  }

  async createCity(createCityDto: CreateCityDto): Promise<City> {
    const country = await this.countryModel
      .findById(createCityDto.country)
      .exec();
    if (!country) {
      throw new NotFoundException(`Country not found`);
    }

    let location = createCityDto.location;

    // If no location coordinates provided, try to get them from Google Maps
    if (!location) {
      try {
        const geocodeResults = await this.googleMapsAdapter.geocode(
          `${createCityDto.name}, ${country.name}`,
        );

        if (geocodeResults.length > 0) {
          const { lat, lng } = geocodeResults[0].geometry.location;
          location = {
            type: 'Point',
            coordinates: [lng, lat],
          };
        }
      } catch (error) {
        // If geocoding fails (e.g., no API key), use default coordinates or continue without location
        console.warn(
          `Geocoding failed for ${createCityDto.name}: ${error.message}`,
        );
        // Set default coordinates (0, 0) if geocoding fails
        location = {
          type: 'Point',
          coordinates: [0, 0],
        };
      }
    }

    const city = new this.cityModel({
      ...createCityDto,
      location,
    });

    return (await city.save()).populate('country');
  }

  async getAllCities(): Promise<City[]> {
    return this.cityModel.find().populate('country').exec();
  }

  async getCityById(id: string): Promise<City> {
    const city = await this.cityModel.findById(id).populate('country').exec();
    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
    return city;
  }

  async getCitiesByCountry(countryId: string): Promise<City[]> {
    return this.cityModel
      .find({ country: countryId })
      .populate('country')
      .exec();
  }

  async findNearbyCities(
    longitude: number,
    latitude: number,
    radius: number = 50,
  ): Promise<City[]> {
    // MongoDB geospatial query to find cities within the specified radius
    return this.cityModel
      .find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        },
      })
      .populate('country')
      .exec();
  }

  async findNearbyPlaces(
    lat: number,
    lng: number,
    radius?: number,
  ): Promise<any[]> {
    return this.googleMapsAdapter.getNearbyPlaces(lat, lng, radius);
  }

  // Country Update and Delete Operations
  async updateCountry(
    id: string,
    updateData: UpdateCountryDto,
  ): Promise<Country> {
    const country = await this.countryModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return country;
  }

  async deleteCountry(id: string): Promise<{ message: string }> {
    // Check if country has cities
    const citiesCount = await this.cityModel
      .countDocuments({ country: id })
      .exec();
    if (citiesCount > 0) {
      throw new Error(
        `Cannot delete country. It has ${citiesCount} cities associated with it.`,
      );
    }

    const result = await this.countryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return { message: 'Country deleted successfully' };
  }

  // City Update and Delete Operations
  async updateCity(id: string, updateData: UpdateCityDto): Promise<City> {
    // If country is being updated, validate it exists
    if (updateData.country) {
      const country = await this.countryModel
        .findById(updateData.country)
        .exec();
      if (!country) {
        throw new NotFoundException(`Country not found`);
      }
    }

    const city = await this.cityModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('country')
      .exec();

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
    return city;
  }

  async deleteCity(id: string): Promise<{ message: string }> {
    const result = await this.cityModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return { message: 'City deleted successfully' };
  }
}
