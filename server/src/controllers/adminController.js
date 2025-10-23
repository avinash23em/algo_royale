const Problem = require('../models/Problem');

const addProblem = async (req, res) => {
  try {
    const problem = new Problem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const seedProblems = async (req, res) => {
  try {
    // Clear existing problems
    await Problem.deleteMany({});

    const sampleProblems = [
      {
        title: "Two Sum",
        difficulty: "Easy",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        inputFormat: "First line contains n (number of elements). Second line contains n space-separated integers. Third line contains target.",
        outputFormat: "Print two space-separated indices.",
        constraints: "2 ≤ n ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9, -10^9 ≤ target ≤ 10^9",
        sampleInput: "4\n2 7 11 15\n9",
        sampleOutput: "0 1",
        testCases: [
          { input: "4\n2 7 11 15\n9", output: "0 1" },  // 2+7=9, indices 0,1
          { input: "3\n3 2 4\n6", output: "1 2" },      // 2+4=6, indices 1,2
          { input: "2\n3 3\n6", output: "0 1" },        // 3+3=6, indices 0,1
          { input: "5\n1 5 3 7 9\n10", output: "2 3" }, // 5+9=10, indices 1,4 (NOT 1,3)
          { input: "5\n-1 -2 -3 -4 -5\n-8", output: "2 4" } // -3+(-5)=-8, indices 2,4
        ]
      },
      {
        title: "Valid Parentheses",
        difficulty: "Easy",
        statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        inputFormat: "Single line containing string s.",
        outputFormat: "Print 'true' if valid, 'false' otherwise.",
        constraints: "1 ≤ s.length ≤ 10^4, s consists of parentheses only '()[]{}'",
        sampleInput: "()",
        sampleOutput: "true",
        testCases: [
          { input: "()", output: "true" },
          { input: "()[]{}", output: "true" },
          { input: "(]", output: "false" },
          { input: "([)]", output: "false" }
        ]
      },
      {
        title: "Maximum Subarray",
        difficulty: "Easy",
        statement: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print the maximum sum.",
        constraints: "1 ≤ n ≤ 10^5, -10^4 ≤ nums[i] ≤ 10^4",
        sampleInput: "5\n-2 1 -3 4 -1",
        sampleOutput: "4",
        testCases: [
          { input: "5\n-2 1 -3 4 -1", output: "4" },
          { input: "1\n1", output: "1" },
          { input: "5\n5 4 -1 7 8", output: "23" }
        ]
      },
      {
        title: "Climbing Stairs",
        difficulty: "Easy",
        statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        inputFormat: "Single line containing integer n.",
        outputFormat: "Print the number of ways.",
        constraints: "1 ≤ n ≤ 45",
        sampleInput: "2",
        sampleOutput: "2",
        testCases: [
          { input: "2", output: "2" },
          { input: "3", output: "3" },
          { input: "4", output: "5" }
        ]
      },
      {
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        statement: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.",
        inputFormat: "First line contains n. Second line contains n space-separated integers (prices).",
        outputFormat: "Print the maximum profit.",
        constraints: "1 ≤ n ≤ 10^5, 0 ≤ prices[i] ≤ 10^4",
        sampleInput: "6\n7 1 5 3 6 4",
        sampleOutput: "5",
        testCases: [
          { input: "6\n7 1 5 3 6 4", output: "5" },
          { input: "5\n7 6 4 3 1", output: "0" },
          { input: "2\n1 2", output: "1" }
        ]
      },
      {
        title: "Add Two Numbers",
        difficulty: "Medium",
        statement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        inputFormat: "First line contains n1 (length of first list). Next n1 lines contain elements of first list. Next line contains n2 (length of second list). Next n2 lines contain elements of second list.",
        outputFormat: "Print the result list elements separated by spaces.",
        constraints: "1 ≤ n1, n2 ≤ 100, 0 ≤ node values ≤ 9",
        sampleInput: "3\n2\n4\n3\n3\n5\n6\n4",
        sampleOutput: "7 0 8",
        testCases: [
          { input: "3\n2\n4\n3\n3\n5\n6\n4", output: "7 0 8" },
          { input: "1\n0\n1\n0", output: "0" },
          { input: "1\n9\n1\n9", output: "8 1" }
        ]
      },
      {
        title: "3Sum",
        difficulty: "Medium",
        statement: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print each triplet on a new line, elements separated by spaces.",
        constraints: "3 ≤ n ≤ 3000, -10^5 ≤ nums[i] ≤ 10^5",
        sampleInput: "6\n-1 0 1 2 -1 -4",
        sampleOutput: "-1 -1 2\n-1 0 1",
        testCases: [
          { input: "6\n-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
          { input: "3\n0 1 1", output: "" },
          { input: "3\n0 0 0", output: "0 0 0" }
        ]
      },
      {
        title: "Container With Most Water",
        difficulty: "Medium",
        statement: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        inputFormat: "First line contains n. Second line contains n space-separated integers (heights).",
        outputFormat: "Print the maximum area.",
        constraints: "2 ≤ n ≤ 10^5, 0 ≤ height[i] ≤ 10^4",
        sampleInput: "9\n1 8 6 2 5 4 8 3 7",
        sampleOutput: "49",
        testCases: [
          { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" },
          { input: "2\n1 1", output: "1" },
          { input: "4\n1 2 1 2", output: "3" }
        ]
      },
      {
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        statement: "Given a string s, return the longest palindromic substring in s.",
        inputFormat: "Single line containing string s.",
        outputFormat: "Print the longest palindromic substring.",
        constraints: "1 ≤ s.length ≤ 1000, s consists of only digits and English letters",
        sampleInput: "babad",
        sampleOutput: "bab",
        testCases: [
          { input: "babad", output: "bab" },
          { input: "cbbd", output: "bb" },
          { input: "a", output: "a" }
        ]
      },
      {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        statement: "Given a string s, find the length of the longest substring without repeating characters.",
        inputFormat: "Single line containing string s.",
        outputFormat: "Print the length of longest substring.",
        constraints: "0 ≤ s.length ≤ 5 * 10^4, s consists of English letters, digits, symbols and spaces.",
        sampleInput: "abcabcbb",
        sampleOutput: "3",
        testCases: [
          { input: "abcabcbb", output: "3" },
          { input: "bbbbb", output: "1" },
          { input: "pwwkew", output: "3" },
          { input: "", output: "0" }
        ]
      },
      {
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        statement: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        inputFormat: "First line contains m. Second line contains m space-separated integers. Third line contains n. Fourth line contains n space-separated integers.",
        outputFormat: "Print the median value.",
        constraints: "0 ≤ m, n ≤ 1000, -10^6 ≤ nums1[i], nums2[i] ≤ 10^6",
        sampleInput: "2\n1 3\n1\n2",
        sampleOutput: "2.0",
        testCases: [
          { input: "2\n1 3\n1\n2", output: "2.0" },
          { input: "2\n1 2\n2\n3 4", output: "2.5" },
          { input: "0\n\n1\n1", output: "1.0" }
        ]
      },
      {
        title: "Regular Expression Matching",
        difficulty: "Hard",
        statement: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' matches any single character and '*' matches zero or more of the preceding element.",
        inputFormat: "First line contains string s. Second line contains pattern p.",
        outputFormat: "Print 'true' if matches, 'false' otherwise.",
        constraints: "1 ≤ s.length ≤ 20, 1 ≤ p.length ≤ 30, s contains only lowercase English letters, p contains only lowercase English letters, '.', and '*'",
        sampleInput: "aa\na",
        sampleOutput: "false",
        testCases: [
          { input: "aa\na", output: "false" },
          { input: "aa\na*", output: "true" },
          { input: "ab\n.*", output: "true" }
        ]
      },
      {
        title: "Merge k Sorted Lists",
        difficulty: "Hard",
        statement: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        inputFormat: "First line contains k (number of lists). Next k lines contain space-separated integers for each list.",
        outputFormat: "Print the merged list elements separated by spaces.",
        constraints: "0 ≤ k ≤ 10^4, 0 ≤ total nodes ≤ 10^4",
        sampleInput: "3\n1 4 5\n1 3 4\n2 6",
        sampleOutput: "1 1 2 3 4 4 5 6",
        testCases: [
          { input: "3\n1 4 5\n1 3 4\n2 6", output: "1 1 2 3 4 4 5 6" },
          { input: "0", output: "" },
          { input: "1", output: "" }
        ]
      },
      {
        title: "Reverse Integer",
        difficulty: "Easy",
        statement: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.",
        inputFormat: "Single line containing integer x.",
        outputFormat: "Print the reversed integer.",
        constraints: "-2^31 ≤ x ≤ 2^31 - 1",
        sampleInput: "123",
        sampleOutput: "321",
        testCases: [
          { input: "123", output: "321" },
          { input: "-123", output: "-321" },
          { input: "120", output: "21" },
          { input: "0", output: "0" },
          { input: "1534236469", output: "0" }
        ]
      },
      {
        title: "Palindrome Number",
        difficulty: "Easy",
        statement: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        inputFormat: "Single line containing integer x.",
        outputFormat: "Print 'true' or 'false'.",
        constraints: "-2^31 ≤ x ≤ 2^31 - 1",
        sampleInput: "121",
        sampleOutput: "true",
        testCases: [
          { input: "121", output: "true" },
          { input: "-121", output: "false" },
          { input: "10", output: "false" },
          { input: "12321", output: "true" },
          { input: "0", output: "true" }
        ]
      },
      {
        title: "Roman to Integer",
        difficulty: "Easy",
        statement: "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Convert a roman numeral to an integer.",
        inputFormat: "Single line containing roman numeral string.",
        outputFormat: "Print the integer value.",
        constraints: "1 ≤ s.length ≤ 15, s contains only characters ('I', 'V', 'X', 'L', 'C', 'D', 'M')",
        sampleInput: "III",
        sampleOutput: "3",
        testCases: [
          { input: "III", output: "3" },
          { input: "LVIII", output: "58" },
          { input: "MCMXCIV", output: "1994" },
          { input: "IV", output: "4" },
          { input: "IX", output: "9" }
        ]
      },
      {
        title: "Longest Common Prefix",
        difficulty: "Easy",
        statement: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.",
        inputFormat: "First line contains n. Next n lines contain strings.",
        outputFormat: "Print the longest common prefix.",
        constraints: "1 ≤ n ≤ 200, 0 ≤ strs[i].length ≤ 200",
        sampleInput: "3\nflower\nflow\nflight",
        sampleOutput: "fl",
        testCases: [
          { input: "3\nflower\nflow\nflight", output: "fl" },
          { input: "3\ndog\nracecar\ncar", output: "" },
          { input: "1\nabc", output: "abc" },
          { input: "2\nab\nabc", output: "ab" },
          { input: "2\na\nb", output: "" }
        ]
      },
      {
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        statement: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.",
        inputFormat: "First line contains n1. Second line contains n1 space-separated integers. Third line contains n2. Fourth line contains n2 space-separated integers.",
        outputFormat: "Print merged list elements separated by spaces.",
        constraints: "0 ≤ n1, n2 ≤ 50, -100 ≤ Node.val ≤ 100",
        sampleInput: "3\n1 2 4\n3\n1 3 4",
        sampleOutput: "1 1 2 3 4 4",
        testCases: [
          { input: "3\n1 2 4\n3\n1 3 4", output: "1 1 2 3 4 4" },
          { input: "0\n\n0\n", output: "" },
          { input: "0\n\n1\n0", output: "0" },
          { input: "2\n1 3\n2\n2 4", output: "1 2 3 4" },
          { input: "1\n5\n1\n1", output: "1 5" }
        ]
      },
      {
        title: "Remove Duplicates from Sorted Array",
        difficulty: "Easy",
        statement: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print the number of unique elements.",
        constraints: "1 ≤ n ≤ 3 * 10^4, -100 ≤ nums[i] ≤ 100",
        sampleInput: "3\n1 1 2",
        sampleOutput: "2",
        testCases: [
          { input: "3\n1 1 2", output: "2" },
          { input: "10\n0 0 1 1 1 2 2 3 3 4", output: "5" },
          { input: "1\n1", output: "1" },
          { input: "5\n1 2 3 4 5", output: "5" },
          { input: "4\n1 1 1 1", output: "1" }
        ]
      },
      {
        title: "Search Insert Position",
        difficulty: "Easy",
        statement: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
        inputFormat: "First line contains n. Second line contains n space-separated integers. Third line contains target.",
        outputFormat: "Print the index.",
        constraints: "1 ≤ n ≤ 10^4, -10^4 ≤ nums[i] ≤ 10^4, -10^4 ≤ target ≤ 10^4",
        sampleInput: "4\n1 3 5 6\n5",
        sampleOutput: "2",
        testCases: [
          { input: "4\n1 3 5 6\n5", output: "2" },
          { input: "4\n1 3 5 6\n2", output: "1" },
          { input: "4\n1 3 5 6\n7", output: "4" },
          { input: "1\n1\n0", output: "0" },
          { input: "3\n1 3 5\n4", output: "2" }
        ]
      },
      {
        title: "Plus One",
        difficulty: "Easy",
        statement: "You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. Increment the large integer by one and return the resulting array of digits.",
        inputFormat: "First line contains n. Second line contains n space-separated digits.",
        outputFormat: "Print the resulting digits separated by spaces.",
        constraints: "1 ≤ n ≤ 100, 0 ≤ digits[i] ≤ 9",
        sampleInput: "3\n1 2 3",
        sampleOutput: "1 2 4",
        testCases: [
          { input: "3\n1 2 3", output: "1 2 4" },
          { input: "3\n4 3 2\n1", output: "4 3 2 1" },
          { input: "1\n9", output: "1 0" },
          { input: "2\n9 9", output: "1 0 0" },
          { input: "4\n1 9 9 9", output: "2 0 0 0" }
        ]
      },
      {
        title: "Sqrt(x)",
        difficulty: "Easy",
        statement: "Given a non-negative integer x, return the square root of x rounded down to the nearest integer.",
        inputFormat: "Single line containing integer x.",
        outputFormat: "Print the square root (integer).",
        constraints: "0 ≤ x ≤ 2^31 - 1",
        sampleInput: "4",
        sampleOutput: "2",
        testCases: [
          { input: "4", output: "2" },
          { input: "8", output: "2" },
          { input: "0", output: "0" },
          { input: "1", output: "1" },
          { input: "16", output: "4" },
          { input: "25", output: "5" }
        ]
      },
      {
        title: "Single Number",
        difficulty: "Easy",
        statement: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print the single number.",
        constraints: "1 ≤ n ≤ 3 * 10^4, -3 * 10^4 ≤ nums[i] ≤ 3 * 10^4",
        sampleInput: "3\n2 2 1",
        sampleOutput: "1",
        testCases: [
          { input: "3\n2 2 1", output: "1" },
          { input: "5\n4 1 2 1 2", output: "4" },
          { input: "1\n1", output: "1" },
          { input: "7\n1 2 3 2 3 4 1", output: "4" },
          { input: "5\n5 5 6 7 7", output: "6" }
        ]
      },
      {
        title: "Letter Combinations of a Phone Number",
        difficulty: "Medium",
        statement: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent (like on a telephone keypad).",
        inputFormat: "Single line containing digit string.",
        outputFormat: "Print all combinations separated by spaces.",
        constraints: "0 ≤ digits.length ≤ 4, digits[i] is a digit in the range ['2', '9']",
        sampleInput: "23",
        sampleOutput: "ad ae af bd be bf cd ce cf",
        testCases: [
          { input: "23", output: "ad ae af bd be bf cd ce cf" },
          { input: "", output: "" },
          { input: "2", output: "a b c" },
          { input: "7", output: "p q r s" },
          { input: "234", output: "adg adh adi aeg aeh aei afg afh afi bdg bdh bdi beg beh bei bfg bfh bfi cdg cdh cdi ceg ceh cei cfg cfh cfi" }
        ]
      },
      {
        title: "Generate Parentheses",
        difficulty: "Medium",
        statement: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
        inputFormat: "Single line containing integer n.",
        outputFormat: "Print all valid combinations, each on a new line.",
        constraints: "1 ≤ n ≤ 8",
        sampleInput: "3",
        sampleOutput: "((()))\n(()())\n(())()\n()(())\n()()()",
        testCases: [
          { input: "3", output: "((()))\n(()())\n(())()\n()(())\n()()()" },
          { input: "1", output: "()" },
          { input: "2", output: "(())\n()()" },
          { input: "4", output: "(((())))\n((()()))\n((())())\n((()))()\n(()(()))\n(()()())\n(()())()\n(())(())\n(())()()\n()((()))\n()(()())\n()(())()\n()()(())\n()()()()" }
        ]
      },
      {
        title: "Permutations",
        difficulty: "Medium",
        statement: "Given an array nums of distinct integers, return all the possible permutations.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print each permutation on a new line, elements separated by spaces.",
        constraints: "1 ≤ n ≤ 6, -10 ≤ nums[i] ≤ 10",
        sampleInput: "3\n1 2 3",
        sampleOutput: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1",
        testCases: [
          { input: "3\n1 2 3", output: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1" },
          { input: "1\n0", output: "0" },
          { input: "2\n0 1", output: "0 1\n1 0" },
          { input: "3\n1 1 2", output: "1 1 2\n1 2 1\n2 1 1" }
        ]
      },
      {
        title: "Rotate Image",
        difficulty: "Medium",
        statement: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).",
        inputFormat: "First line contains n. Next n lines contain n space-separated integers.",
        outputFormat: "Print the rotated matrix, each row on a new line.",
        constraints: "1 ≤ n ≤ 20, -1000 ≤ matrix[i][j] ≤ 1000",
        sampleInput: "3\n1 2 3\n4 5 6\n7 8 9",
        sampleOutput: "7 4 1\n8 5 2\n9 6 3",
        testCases: [
          { input: "3\n1 2 3\n4 5 6\n7 8 9", output: "7 4 1\n8 5 2\n9 6 3" },
          { input: "2\n1 2\n3 4", output: "3 1\n4 2" },
          { input: "1\n1", output: "1" },
          { input: "4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16", output: "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11" }
        ]
      },
      {
        title: "Group Anagrams",
        difficulty: "Medium",
        statement: "Given an array of strings strs, group the anagrams together.",
        inputFormat: "First line contains n. Next n lines contain strings.",
        outputFormat: "Print groups of anagrams, each group on a new line with elements separated by spaces.",
        constraints: "1 ≤ n ≤ 10^4, 0 ≤ strs[i].length ≤ 100",
        sampleInput: "6\neat\ntea\ntan\nate\nnat\nbat",
        sampleOutput: "bat\neat tea ate\ntan nat",
        testCases: [
          { input: "6\neat\ntea\ntan\nate\nnat\nbat", output: "bat\neat tea ate\ntan nat" },
          { input: "1\na", output: "a" },
          { input: "2\nab\nba", output: "ab ba" },
          { input: "3\nabc\nbca\ncab", output: "abc bca cab" }
        ]
      },
      {
        title: "Pow(x, n)",
        difficulty: "Medium",
        statement: "Implement pow(x, n), which calculates x raised to the power n.",
        inputFormat: "First line contains x (double). Second line contains n (integer).",
        outputFormat: "Print x^n.",
        constraints: "-100.0 < x < 100.0, -2^31 ≤ n ≤ 2^31-1",
        sampleInput: "2.00000\n10",
        sampleOutput: "1024.00000",
        testCases: [
          { input: "2.00000\n10", output: "1024.00000" },
          { input: "2.10000\n3", output: "9.26100" },
          { input: "2.00000\n-2", output: "0.25000" },
          { input: "1.00000\n-2147483648", output: "1.00000" },
          { input: "2.00000\n0", output: "1.00000" }
        ]
      },
      {
        title: "Spiral Matrix",
        difficulty: "Medium",
        statement: "Given an m x n matrix, return all elements of the matrix in spiral order.",
        inputFormat: "First line contains m and n. Next m lines contain n space-separated integers.",
        outputFormat: "Print elements in spiral order separated by spaces.",
        constraints: "1 ≤ m, n ≤ 10, -100 ≤ matrix[i][j] ≤ 100",
        sampleInput: "3 3\n1 2 3\n4 5 6\n7 8 9",
        sampleOutput: "1 2 3 6 9 8 7 4 5",
        testCases: [
          { input: "3 3\n1 2 3\n4 5 6\n7 8 9", output: "1 2 3 6 9 8 7 4 5" },
          { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", output: "1 2 3 4 8 12 11 10 9 5 6 7" },
          { input: "1 1\n1", output: "1" },
          { input: "2 2\n1 2\n3 4", output: "1 2 4 3" }
        ]
      },
      {
        title: "Jump Game",
        difficulty: "Medium",
        statement: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print 'true' or 'false'.",
        constraints: "1 ≤ n ≤ 10^4, 0 ≤ nums[i] ≤ 10^5",
        sampleInput: "5\n2 3 1 1 4",
        sampleOutput: "true",
        testCases: [
          { input: "5\n2 3 1 1 4", output: "true" },
          { input: "5\n3 2 1 0 4", output: "false" },
          { input: "1\n0", output: "true" },
          { input: "2\n0 1", output: "false" },
          { input: "3\n2 0 0", output: "true" }
        ]
      },
      {
        title: "Unique Paths",
        difficulty: "Medium",
        statement: "There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths.",
        inputFormat: "Two space-separated integers m and n.",
        outputFormat: "Print the number of unique paths.",
        constraints: "1 ≤ m, n ≤ 100",
        sampleInput: "3 7",
        sampleOutput: "28",
        testCases: [
          { input: "3 7", output: "28" },
          { input: "3 2", output: "3" },
          { input: "1 1", output: "1" },
          { input: "2 2", output: "2" },
          { input: "3 3", output: "6" }
        ]
      },
      {
        title: "Minimum Path Sum",
        difficulty: "Medium",
        statement: "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time.",
        inputFormat: "First line contains m and n. Next m lines contain n space-separated integers.",
        outputFormat: "Print the minimum path sum.",
        constraints: "1 ≤ m, n ≤ 200, 0 ≤ grid[i][j] ≤ 100",
        sampleInput: "3 3\n1 3 1\n1 5 1\n4 2 1",
        sampleOutput: "7",
        testCases: [
          { input: "3 3\n1 3 1\n1 5 1\n4 2 1", output: "7" },
          { input: "2 3\n1 2 3\n4 5 6", output: "12" },
          { input: "1 1\n1", output: "1" },
          { input: "2 2\n1 1\n1 1", output: "3" }
        ]
      },
      {
        title: "Word Search",
        difficulty: "Medium",
        statement: "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring.",
        inputFormat: "First line contains m and n. Next m lines contain n characters. Last line contains the word.",
        outputFormat: "Print 'true' or 'false'.",
        constraints: "1 ≤ m, n ≤ 6, 1 ≤ word.length ≤ 15",
        sampleInput: "3 4\nABCE\nSFCS\nADEE\nABCCED",
        sampleOutput: "true",
        testCases: [
          { input: "3 4\nABCE\nSFCS\nADEE\nABCCED", output: "true" },
          { input: "3 4\nABCE\nSFCS\nADEE\nSEE", output: "true" },
          { input: "3 4\nABCE\nSFCS\nADEE\nABCB", output: "false" },
          { input: "1 1\nA\nA", output: "true" }
        ]
      },
      {
        title: "Subsets",
        difficulty: "Medium",
        statement: "Given an integer array nums of unique elements, return all possible subsets (the power set).",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print each subset on a new line, elements separated by spaces. Print empty subset as empty line.",
        constraints: "1 ≤ n ≤ 10, -10 ≤ nums[i] ≤ 10",
        sampleInput: "3\n1 2 3",
        sampleOutput: "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3",
        testCases: [
          { input: "3\n1 2 3", output: "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3" },
          { input: "1\n0", output: "\n0" },
          { input: "2\n1 2", output: "\n1\n2\n1 2" }
        ]
      },
      {
        title: "Sort Colors",
        difficulty: "Medium",
        statement: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue. We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.",
        inputFormat: "First line contains n. Second line contains n space-separated integers (0, 1, or 2).",
        outputFormat: "Print the sorted array.",
        constraints: "1 ≤ n ≤ 300, nums[i] is either 0, 1, or 2",
        sampleInput: "6\n2 0 2 1 1 0",
        sampleOutput: "0 0 1 1 2 2",
        testCases: [
          { input: "6\n2 0 2 1 1 0", output: "0 0 1 1 2 2" },
          { input: "3\n2 0 1", output: "0 1 2" },
          { input: "1\n0", output: "0" },
          { input: "5\n1 2 0 1 2", output: "0 1 1 2 2" },
          { input: "4\n2 2 2 2", output: "2 2 2 2" }
        ]
      },
      {
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        statement: "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
        inputFormat: "First line contains n. Second line contains n space-separated integers. Third line contains target.",
        outputFormat: "Print the index or -1.",
        constraints: "1 ≤ n ≤ 5000, -10^4 ≤ nums[i] ≤ 10^4, -10^4 ≤ target ≤ 10^4",
        sampleInput: "7\n4 5 6 7 0 1 2\n0",
        sampleOutput: "4",
        testCases: [
          { input: "7\n4 5 6 7 0 1 2\n0", output: "4" },
          { input: "7\n4 5 6 7 0 1 2\n3", output: "-1" },
          { input: "1\n1\n0", output: "-1" },
          { input: "3\n3 1 2\n1", output: "1" },
          { input: "5\n5 1 2 3 4\n5", output: "0" }
        ]
      },
      {
        title: "Trapping Rain Water",
        difficulty: "Hard",
        statement: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print the total water trapped.",
        constraints: "1 ≤ n ≤ 2 * 10^4, 0 ≤ height[i] ≤ 10^5",
        sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
        sampleOutput: "6",
        testCases: [
          { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
          { input: "6\n4 2 0 3 2 5", output: "9" },
          { input: "1\n5", output: "0" },
          { input: "3\n3 0 2", output: "2" },
          { input: "5\n5 4 3 2 1", output: "0" }
        ]
      },
      {
        title: "Wildcard Matching",
        difficulty: "Hard",
        statement: "Given an input string s and a pattern p, implement wildcard pattern matching with support for '?' and '*' where '?' matches any single character and '*' matches any sequence of characters (including the empty sequence).",
        inputFormat: "First line contains string s. Second line contains pattern p.",
        outputFormat: "Print 'true' or 'false'.",
        constraints: "0 ≤ s.length, p.length ≤ 2000",
        sampleInput: "aa\na",
        sampleOutput: "false",
        testCases: [
          { input: "aa\na", output: "false" },
          { input: "aa\n*", output: "true" },
          { input: "cb\n?a", output: "false" },
          { input: "adceb\n*a*b", output: "true" },
          { input: "acdcb\na*c?b", output: "false" }
        ]
      },
      {
        title: "N-Queens",
        difficulty: "Hard",
        statement: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle.",
        inputFormat: "Single line containing integer n.",
        outputFormat: "Print the number of distinct solutions.",
        constraints: "1 ≤ n ≤ 9",
        sampleInput: "4",
        sampleOutput: "2",
        testCases: [
          { input: "4", output: "2" },
          { input: "1", output: "1" },
          { input: "8", output: "92" },
          { input: "5", output: "10" },
          { input: "3", output: "0" }
        ]
      },
      {
        title: "Edit Distance",
        difficulty: "Hard",
        statement: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You can insert, delete, or replace a character.",
        inputFormat: "First line contains word1. Second line contains word2.",
        outputFormat: "Print the minimum number of operations.",
        constraints: "0 ≤ word1.length, word2.length ≤ 500",
        sampleInput: "horse\nros",
        sampleOutput: "3",
        testCases: [
          { input: "horse\nros", output: "3" },
          { input: "intention\nexecution", output: "5" },
          { input: "abc\nabc", output: "0" },
          { input: "abc\ndef", output: "3" },
          { input: "\nabc", output: "3" }
        ]
      },
      {
        title: "Largest Rectangle in Histogram",
        difficulty: "Hard",
        statement: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print the largest rectangle area.",
        constraints: "1 ≤ n ≤ 10^5, 0 ≤ heights[i] ≤ 10^4",
        sampleInput: "6\n2 1 5 6 2 3",
        sampleOutput: "10",
        testCases: [
          { input: "6\n2 1 5 6 2 3", output: "10" },
          { input: "1\n2", output: "2" },
          { input: "4\n2 4 3 1", output: "6" },
          { input: "5\n1 1 1 1 1", output: "5" },
          { input: "3\n5 4 3", output: "12" }
        ]
      },
      {
        title: "Word Ladder",
        difficulty: "Hard",
        statement: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words such that: the first word is beginWord, the last word is endWord, and each adjacent pair of words differs by a single letter. Return the length of the shortest transformation sequence, or 0 if no such sequence exists.",
        inputFormat: "First line contains beginWord. Second line contains endWord. Third line contains n. Next n lines contain dictionary words.",
        outputFormat: "Print the length of shortest transformation sequence.",
        constraints: "1 ≤ beginWord.length ≤ 10, endWord.length == beginWord.length, 1 ≤ n ≤ 5000",
        sampleInput: "hit\ncog\n6\nhot\ndot\ndog\nlot\nlog\ncog",
        sampleOutput: "5",
        testCases: [
          { input: "hit\ncog\n6\nhot\ndot\ndog\nlot\nlog\ncog", output: "5" },
          { input: "hit\ncog\n5\nhot\ndot\ndog\nlot\nlog", output: "0" },
          { input: "a\nc\n2\na\nb\nc", output: "2" },
          { input: "hot\ndog\n3\nhot\ndog\ndot", output: "3" }
        ]
      },
      {
        title: "Minimum Window Substring",
        difficulty: "Hard",
        statement: "Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string.",
        inputFormat: "First line contains string s. Second line contains string t.",
        outputFormat: "Print the minimum window substring.",
        constraints: "1 ≤ s.length, t.length ≤ 10^5",
        sampleInput: "ADOBECODEBANC\nABC",
        sampleOutput: "BANC",
        testCases: [
          { input: "ADOBECODEBANC\nABC", output: "BANC" },
          { input: "a\na", output: "a" },
          { input: "a\naa", output: "" },
          { input: "ab\nb", output: "b" },
          { input: "abc\ncba", output: "abc" }
        ]
      },
      {
        title: "Longest Valid Parentheses",
        difficulty: "Hard",
        statement: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
        inputFormat: "Single line containing string s.",
        outputFormat: "Print the length of longest valid parentheses substring.",
        constraints: "0 ≤ s.length ≤ 3 * 10^4",
        sampleInput: "(()",
        sampleOutput: "2",
        testCases: [
          { input: "(()", output: "2" },
          { input: ")()())", output: "4" },
          { input: "", output: "0" },
          { input: "()(())", output: "6" },
          { input: "((((", output: "0" }
        ]
      },
      {
        title: "Sudoku Solver",
        difficulty: "Hard",
        statement: "Write a program to solve a Sudoku puzzle by filling the empty cells. A sudoku solution must satisfy all of the following rules: Each of the digits 1-9 must occur exactly once in each row, column, and 3x3 sub-box.",
        inputFormat: "9 lines, each containing 9 characters (1-9 or . for empty).",
        outputFormat: "Print 'valid' if solvable, 'invalid' otherwise.",
        constraints: "board.length == 9, board[i].length == 9",
        sampleInput: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79",
        sampleOutput: "valid",
        testCases: [
          { input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", output: "valid" },
          { input: ".........\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n.........", output: "valid" },
          { input: "12.......\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n.........", output: "valid" }
        ]
      },
      {
        title: "First Missing Positive",
        difficulty: "Hard",
        statement: "Given an unsorted integer array nums, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.",
        inputFormat: "First line contains n. Second line contains n space-separated integers.",
        outputFormat: "Print the smallest missing positive integer.",
        constraints: "1 ≤ n ≤ 10^5, -2^31 ≤ nums[i] ≤ 2^31 - 1",
        sampleInput: "3\n1 2 0",
        sampleOutput: "3",
        testCases: [
          { input: "3\n1 2 0", output: "3" },
          { input: "4\n3 4 -1 1", output: "2" },
          { input: "4\n7 8 9 11", output: "1" },
          { input: "5\n1 2 3 4 5", output: "6" },
          { input: "2\n2 1", output: "3" }
        ]
      },
      {
        title: "Count Vowels",
        difficulty: "Easy",
        statement: "Given a string, count the number of vowels (a, e, i, o, u) it contains. Treat uppercase and lowercase vowels the same.",
        inputFormat: "A single line containing string s.",
        outputFormat: "Print the number of vowels in s.",
        constraints: "1 ≤ length(s) ≤ 1000; s contains only alphabetic characters and spaces.",
        sampleInput: "hello",
        sampleOutput: "2",
        testCases: [
          { input: "hello", output: "2" },
          { input: "Programming", output: "3" },
          { input: "aeiou", output: "5" },
          { input: "AEIOU", output: "5" },
          { input: "xyz", output: "0" }
        ]
      },
      {
        title: "Sum of Digits",
        difficulty: "Easy",
        statement: "Given a positive integer n, compute the sum of its digits.",
        inputFormat: "A single line containing integer n.",
        outputFormat: "Print the sum of digits of n.",
        constraints: "1 ≤ n ≤ 10^9",
        sampleInput: "123",
        sampleOutput: "6",
        testCases: [
          { input: "123", output: "6" },
          { input: "9875", output: "29" },
          { input: "1", output: "1" },
          { input: "999", output: "27" },
          { input: "100000", output: "1" }
        ]
      },
      {
        title: "Check Prime",
        difficulty: "Easy",
        statement: "Given an integer n, determine whether it is a prime number. A prime number has exactly two distinct positive divisors: 1 and itself.",
        inputFormat: "A single line containing integer n.",
        outputFormat: "Print 'YES' if n is prime; otherwise print 'NO'.",
        constraints: "1 ≤ n ≤ 10^6",
        sampleInput: "7",
        sampleOutput: "YES",
        testCases: [
          { input: "7", output: "YES" },
          { input: "10", output: "NO" },
          { input: "2", output: "YES" },
          { input: "1", output: "NO" },
          { input: "97", output: "YES" }
        ]
      }
    ];

    await Problem.insertMany(sampleProblems);
    res.json({ message: 'Sample problems seeded successfully', count: sampleProblems.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProblem,
  seedProblems
};
