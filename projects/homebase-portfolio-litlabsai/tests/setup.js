import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-19';

configure({ adapter: new Adapter() });

// Global test setup
window.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

// Mock Intersection Observer
class MockIntersectionObserver {
  constructor() {
    this.callbacks = [];
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;