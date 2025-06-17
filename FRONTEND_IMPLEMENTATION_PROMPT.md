# Frontend Implementation Task for StayKaru Application

## Task Overview

You are tasked with developing the frontend for the StayKaru application using React Native and Expo. The backend has been completed and deployed to Heroku with a fully functional JWT-based authentication system. Your job is to create a user-friendly, responsive, and fully functional mobile application that connects to this backend.

## Key Requirements

1. Develop a complete React Native/Expo mobile application that implements all features described in the STAYKARU_FEATURES_GUIDE.md document.

2. Implement role-based access control for Students, Landlords, Food Providers, and Admins, with appropriate screens and functionality for each role.

3. Create a seamless authentication flow using JWT tokens that connects to the deployed backend.

4. Design a modern, intuitive UI that follows the style guidelines provided in the features guide.

5. Ensure all API integrations work correctly with the deployed backend at: https://staykaru-backend-60ed08adb2a7.herokuapp.com

## Documentation and Resources

You have access to the following documentation:

1. STAYKARU_FEATURES_GUIDE.md - A comprehensive breakdown of all features, screens, API endpoints, and data models required for the application.

2. JWT_AUTHENTICATION_FRONTEND_GUIDE.md - A detailed guide for implementing the JWT authentication system in the frontend.

3. The deployed backend API is available at: https://staykaru-backend-60ed08adb2a7.herokuapp.com

## Implementation Approach

Please follow this step-by-step approach:

1. **Initial Setup**:
   - Set up a new React Native project using Expo
   - Install all required dependencies as listed in the features guide
   - Configure the project structure according to the recommended folder structure

2. **Authentication Implementation**:
   - Implement the authentication system following JWT_AUTHENTICATION_FRONTEND_GUIDE.md
   - Create login and registration screens with proper validation
   - Set up context providers for managing auth state across the app

3. **Navigation Structure**:
   - Implement the navigation structure as outlined in the screen flow diagrams
   - Create role-based navigation that shows different screens based on user role

4. **Core Features Implementation**:
   - Implement common features for all users (profile management, notifications)
   - Develop role-specific features starting with Student features
   - Continue with Landlord, Food Provider, and Admin features

5. **API Integration**:
   - Set up API client with proper JWT token handling
   - Implement API calls for all endpoints documented in the features guide
   - Handle loading states, error handling, and retry mechanisms

6. **UI/UX Design**:
   - Develop a consistent, modern UI following the style guide
   - Ensure responsive design that works across different device sizes
   - Implement appropriate loading indicators and error messages

7. **Testing**:
   - Test all user flows for each role
   - Verify API integrations are working correctly
   - Test edge cases and error handling

## Deliverables

1. Complete source code for the React Native/Expo application
2. Documentation for any custom implementation details or decisions
3. Instructions for running the application locally
4. Screenshots of key screens for each user role

## Timeline

Please provide an estimated timeline for completing each phase of development. The entire project should be completed within 4-6 weeks.

## Communication

Regular updates on progress are expected. Please flag any issues with the backend API or documentation immediately so they can be addressed.

## Getting Started

1. Review the STAYKARU_FEATURES_GUIDE.md thoroughly to understand all requirements
2. Study the JWT_AUTHENTICATION_FRONTEND_GUIDE.md to understand the authentication system
3. Set up your development environment and create the initial project structure
4. Begin with implementing the authentication system as it's the foundation for all other features

Remember that the application serves multiple user roles with distinct needs. Ensure that each role has access to only the features they need, with intuitive navigation and clear UI elements that make the app easy to use.

Good luck with the implementation! Feel free to ask any questions if you need clarification on any aspect of the requirements.
