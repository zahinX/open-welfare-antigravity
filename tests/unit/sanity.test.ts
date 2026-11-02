import { describe, it, expect } from 'vitest'

describe('Sanity Check', () => {
  it('should verify that the test runner is configured correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('should verify environment variables are accessible in tests', () => {
    // This will pass even if undefined, but ensures process.env doesn't throw
    expect(typeof process.env.NODE_ENV).toBe('string')
  })
})
