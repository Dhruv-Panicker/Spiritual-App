# Testing Guide

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized into three main categories:

### 1. Unit Tests (`__tests__/unit/`)
- Test individual functions and services in isolation
- Fast execution
- Mock external dependencies

### 2. Integration Tests (`__tests__/integration/`)
- Test how different parts work together
- Test contexts and state management
- Test API interactions

### 3. Component Tests (`__tests__/components/`)
- Test React components
- Test user interactions
- Test rendering and props

## Writing Tests

### Example: Unit Test

```typescript
import { notificationService } from '@/services/notificationService';

describe('NotificationService', () => {
  it('should send local notification', async () => {
    const notificationData = {
      title: 'Test',
      body: 'Test body',
    };

    const id = await notificationService.sendLocalNotification(notificationData);
    
    expect(id).toBeDefined();
  });
});
```

### Example: Component Test

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should handle button press', () => {
    const { getByText } = render(<MyComponent />);
    
    const button = getByText('Click me');
    fireEvent.press(button);
    
    // Assert expected behavior
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should still pass after refactoring

2. **Use Descriptive Test Names**
   - `should return quotes when fetchQuotes is called`
   - `should display error message when login fails`

3. **Arrange-Act-Assert Pattern**
   ```typescript
   test('should do something', () => {
     // Arrange
     const input = 'value';
     
     // Act
     const result = function(input);
     
     // Assert
     expect(result).toBe(expected);
   });
   ```

4. **One Assertion Per Test** (when possible)
   - Keeps tests focused and easier to debug

5. **Mock External Dependencies**
   - Mock API calls, Expo modules, etc.
   - Tests should run fast and be isolated

## Coverage

View coverage reports:
```bash
npm run test:coverage
```

Open HTML report:
```
open coverage/lcov-report/index.html
```

Target coverage: **75%+ overall**

## Common Issues

### Tests Failing Due to Async Issues
- Use `await` for async operations
- Use `act()` from React Testing Library for state updates

### Mock Not Working
- Check mock is defined before test
- Ensure mock path matches import path exactly

### Expo Module Not Found
- Add mock to `jest.setup.js`
- Check module name matches exactly

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Plan](./../TESTING_PLAN.md)

