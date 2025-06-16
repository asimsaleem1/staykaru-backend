# Converting to MongoDB-Based Authentication

This document outlines the steps to convert from Firebase authentication to a MongoDB-based email/password authentication system.

## Backend Changes

### 1. Update User Schema (Already Done)
The User schema already has the required fields:
- email
- password (plain text as requested)
- name
- gender
- role
- phone

### 2. Update Authentication Services

#### Create JWT Configuration
File: `src/config/jwt.config.ts` (already exists)
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'staykaru-default-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
```

#### Update Auth Module
File: `src/modules/auth/auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### Update JwtStrategy
File: `src/modules/auth/strategies/jwt.strategy.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    return this.userService.findOne(payload.sub);
  }
}
```

#### Update JWT Auth Guard
File: `src/modules/auth/guards/jwt-auth.guard.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### Update Auth Service
File: `src/modules/auth/services/auth.service.ts`
```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Create user with plain text password as per requirement
      const createUserDto: CreateUserDto = {
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password, // Store plain text password
        role: registerDto.role,
        phone: registerDto.phone,
        gender: registerDto.gender,
      };

      const user = await this.userService.create(createUserDto);

      return {
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user by email
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Compare plain text passwords as per requirement
      if (user.password !== loginDto.password) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      const payload = { email: user.email, sub: user._id, role: user.role };
      
      return {
        message: 'Login successful',
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          gender: user.gender,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async validateUser(userId: string) {
    return this.userService.findOne(userId);
  }
}
```

#### Update Auth Controller
File: `src/modules/auth/controller/auth.controller.ts`
```typescript
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        message: 'Registration successful',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        message: 'Login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'student',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'student',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }
}
```

#### Update User Service
Add the findByEmail method to the UserService:

File: `src/modules/user/services/user.service.ts`
```typescript
async findByEmail(email: string): Promise<User | null> {
  const cacheKey = `user:email:${email}`;
  const cached = await this.cacheManager.get<User>(cacheKey);
  
  if (cached) {
    return this.decryptUserData(cached);
  }

  const user = await this.userModel.findOne({ email }).exec();
  if (user) {
    await this.cacheManager.set(cacheKey, user);
    return this.decryptUserData(user);
  }
  return null;
}
```

### 3. Update Role-Based Guards

For example, update the LandlordGuard:

File: `src/modules/accommodation/guards/landlord.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/schema/user.schema';

@Injectable()
export class LandlordGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user._id) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role !== UserRole.LANDLORD) {
      throw new ForbiddenException('Only landlords can perform this action');
    }

    return true;
  }
}
```

### 4. Update App Module
Remove Firebase config and ensure JWT config is loaded:

File: `src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LocationModule } from './modules/location/location.module';
import { AccommodationModule } from './modules/accommodation/accommodation.module';
import { FoodServiceModule } from './modules/food_service/food-service.module';
import { BookingModule } from './modules/booking/booking.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cacheConfig from './config/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, jwtConfig, cacheConfig],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('cache.host'),
        port: configService.get('cache.port'),
        ttl: configService.get('cache.ttl'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongoUri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    LocationModule,
    AccommodationModule,
    FoodServiceModule,
    BookingModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    NotificationModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Frontend Changes

### 1. Create API Client
File: `src/api/apiClient.js`
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.100.84:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Create Auth Context
File: `src/context/AuthContext.js`
```javascript
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      
      setUserToken(access_token);
      setUserInfo(user);
      
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', userData);
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(userInfoString));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('isLoggedIn error', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        login, 
        logout, 
        register, 
        isLoading, 
        userToken,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Create Login Screen
File: `src/screens/LoginScreen.js`
```javascript
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import TextInput from '../components/TextInput';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useContext(AuthContext);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async (values) => {
    const result = await login(values.email, values.password);
    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>StayKaru</Text>
        </View>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={touched.email && errors.email}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={touched.password && errors.password}
                placeholder="Enter your password"
                secureTextEntry={secureTextEntry}
                toggleSecureEntry={toggleSecureEntry}
                isPassword
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#333',
    fontSize: 14,
  },
  registerLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
```

### 4. Create Register Screen
File: `src/screens/RegisterScreen.js`
```javascript
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import TextInput from '../components/TextInput';
import { Picker } from '@react-native-picker/picker';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[0-9]{8,15}$/, 'Please enter a valid phone number'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['student', 'landlord', 'food_provider'], 'Please select a valid role'),
});

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useContext(AuthContext);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleRegister = async (values) => {
    const result = await register(values);
    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please login with your credentials.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            phone: '',
            gender: 'male',
            role: 'student'
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={styles.formContainer}>
              <TextInput
                label="Full Name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                error={touched.name && errors.name}
                placeholder="Enter your full name"
              />

              <TextInput
                label="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={touched.email && errors.email}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={touched.password && errors.password}
                placeholder="Create a password"
                secureTextEntry={secureTextEntry}
                toggleSecureEntry={toggleSecureEntry}
                isPassword
              />

              <TextInput
                label="Phone Number"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                error={touched.phone && errors.phone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Gender</Text>
                <Picker
                  selectedValue={values.gender}
                  onValueChange={(itemValue) => setFieldValue('gender', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
                {touched.gender && errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Role</Text>
                <Picker
                  selectedValue={values.role}
                  onValueChange={(itemValue) => setFieldValue('role', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Student" value="student" />
                  <Picker.Item label="Landlord" value="landlord" />
                  <Picker.Item label="Food Provider" value="food_provider" />
                </Picker>
                {touched.role && errors.role && (
                  <Text style={styles.errorText}>{errors.role}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  registerButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    color: '#333',
    fontSize: 14,
  },
  loginLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
```

### 5. Update App Navigation
File: `src/navigation/AppNavigator.tsx`
```typescript
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// App Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingsScreen from '../screens/BookingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 6. Wrap App with Auth Provider
File: `App.tsx` or main app file
```typescript
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

## Implementation Steps

1. Remove Firebase config and references
2. Implement JWT auth in backend
3. Update UserService with findByEmail method
4. Create AuthService with MongoDB-based authentication
5. Create/update AuthController endpoints
6. Update frontend with AuthContext and API client
7. Implement login/register screens with Formik/Yup
8. Update navigation to use JWT tokens
9. Test login/registration flow end-to-end
