fake_users = [
    { "name": "User 1", "id": "user1", "city": "San Francisco", "state": "CA" },
    { "name": "User 2", "id": "user2", "city": "New York", "state": "NY" },
]

# Toggle to enable/disable fake users
USE_FAKE_USERS = False

def get_users():
    if USE_FAKE_USERS:
        return fake_users
    # Replace with real user fetching logic as needed
    return []
