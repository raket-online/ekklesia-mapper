/**
 * XSS Protection Test
 *
 * This file demonstrates the XSS protection implemented in the app.
 * Run with: node test-xss-protection.js
 */

// Simulate the sanitizeInput function (copy from src/utils/sanitize.ts)
function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return ''
  }

  const str = String(input)

  // Remove HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '')

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:/gi, '')
  sanitized = sanitized.replace(/vbscript:/gi, '')

  // Remove dangerous characters
  sanitized = sanitized.replace(/["'<>]/g, '')

  // Remove extra whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ')

  return sanitized
}

// Test cases with common XSS payloads
const testCases = [
  {
    name: 'Script tag injection',
    input: '<script>alert("XSS")</script>',
    expected: 'alert(XSS)',
    notes: 'HTML tags removed, quotes removed'
  },
  {
    name: 'IMG tag with onerror',
    input: '<img src=x onerror="alert(1)">',
    expected: '',
    notes: 'All HTML and quotes removed'
  },
  {
    name: 'JavaScript protocol',
    input: 'javascript:alert("XSS")',
    expected: 'alert(XSS)',
    notes: 'Protocol removed, quotes removed'
  },
  {
    name: 'DIV with onclick',
    input: '<div onclick="alert(1)">Click me</div>',
    expected: 'Click me',
    notes: 'Tags and event handler removed'
  },
  {
    name: 'SVG with onload',
    input: '<svg onload="alert(1)">',
    expected: '',
    notes: 'Tag removed'
  },
  {
    name: 'IFrame injection',
    input: '<iframe src="http://evil.com"></iframe>',
    expected: '',
    notes: 'Tag removed'
  },
  {
    name: 'Data URI',
    input: 'data:text/html,<script>alert(1)</script>',
    expected: 'text/html,alert(1)',
    notes: 'Protocol removed, tags removed'
  },
  {
    name: 'Multiple event handlers',
    input: '<img onmouseover="alert(1)" onmouseout="alert(2)">',
    expected: '',
    notes: 'All HTML removed'
  },
  {
    name: 'Mixed case script tag',
    input: '<ScRiPt>alert("XSS")</ScRiPt>',
    expected: 'alert(XSS)',
    notes: 'Tags removed (case insensitive)'
  },
  {
    name: 'Legitimate input (should be preserved)',
    input: 'Grace Community Church',
    expected: 'Grace Community Church',
    notes: 'Safe input preserved'
  },
  {
    name: 'Input with quotes (should be stripped)',
    input: 'St. John\'s "New" Church',
    expected: 'St. Johns New Church',
    notes: 'Quotes removed for safety'
  }
]

console.log('🔒 Testing XSS Protection\n')

let passed = 0
let failed = 0

testCases.forEach(test => {
  const result = sanitizeInput(test.input)
  const success = result === test.expected

  if (success) {
    passed++
    console.log(`✅ ${test.name}`)
    if (test.notes) {
      console.log(`   ℹ️  ${test.notes}`)
    }
  } else {
    failed++
    console.log(`❌ ${test.name}`)
    console.log(`   Input:    "${test.input}"`)
    console.log(`   Expected: "${test.expected}"`)
    console.log(`   Got:      "${result}"`)
    if (test.notes) {
      console.log(`   ℹ️  ${test.notes}`)
    }
  }
})

console.log(`\n📊 Results: ${passed}/${testCases.length} tests passed`)

if (failed === 0) {
  console.log('✨ All XSS protection tests passed!')
  process.exit(0)
} else {
  console.log(`⚠️  ${failed} test(s) failed`)
  process.exit(1)
}
