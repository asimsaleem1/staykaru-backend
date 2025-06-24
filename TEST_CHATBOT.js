const http = require('http');

class ChatbotTester {
  constructor() {
    this.baseUrl = 'localhost';
    this.port = 3000;
  }

  async testChatbot() {
    console.log('🤖 Testing StayKaru Chatbot...');
    console.log('='.repeat(50));

    const testMessages = [
      'Hello',
      'Hi, I need help',
      'Find accommodation in Karachi',
      'Show me cheap hostels',
      'I want to order food',
      'Show Pakistani restaurants',
      'I want biryani',
      'Help with booking',
      'How to place an order?',
      'What can you do?',
      'Find pizza in Lahore',
      'Budget accommodation near university'
    ];

    console.log('Testing chatbot responses...\n');

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`${i + 1}. 👤 User: "${message}"`);
      
      try {
        const response = await this.sendMessage(message);
        console.log(`   🤖 Bot: ${response.message}`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`   📊 Found ${response.data.length} items`);
          if (response.data.length > 0) {
            const firstItem = response.data[0];
            if (firstItem.title) {
              console.log(`   🏠 First: ${firstItem.title} - ${firstItem.city}`);
            } else if (firstItem.name) {
              console.log(`   🍽️ First: ${firstItem.name}`);
            }
          }
        }
        
        if (response.suggestions) {
          console.log(`   💡 Suggestions: ${response.suggestions.slice(0, 2).join(', ')}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
      
      // Wait a bit between requests
      await this.delay(500);
    }

    // Test other endpoints
    console.log('\n' + '='.repeat(50));
    console.log('🔧 Testing Chatbot Endpoints...\n');

    await this.testChatbotEndpoints();
  }

  async testChatbotEndpoints() {
    const endpoints = [
      {
        name: 'Get Quick Suggestions',
        method: 'GET',
        path: '/api/chatbot/suggestions'
      },
      {
        name: 'Get Chatbot Help',
        method: 'GET', 
        path: '/api/chatbot/help'
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing: ${endpoint.name}`);
      try {
        const response = await this.makeRequest(endpoint.method, endpoint.path);
        if (response.status === 200) {
          console.log('✅ Success');
          if (endpoint.name === 'Get Quick Suggestions' && response.data.suggestions) {
            console.log(`   Found ${response.data.suggestions.length} suggestions`);
            console.log(`   Examples: ${response.data.suggestions.slice(0, 3).join(', ')}`);
          }
          if (endpoint.name === 'Get Chatbot Help' && response.data.capabilities) {
            console.log(`   Capabilities: ${response.data.capabilities.length} features`);
            console.log(`   Cities: ${response.data.supported_cities.join(', ')}`);
          }
        } else {
          console.log(`❌ Failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      console.log('');
    }
  }

  async sendMessage(message) {
    const response = await this.makeRequest('POST', '/api/chatbot/message', { message });
    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : null;
      
      const options = {
        hostname: this.baseUrl,
        port: this.port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
        }
      };

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = responseBody ? JSON.parse(responseBody) : {};
            resolve({
              status: res.statusCode,
              data: parsedData
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: responseBody
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the chatbot test
const tester = new ChatbotTester();
tester.testChatbot().catch(console.error);
