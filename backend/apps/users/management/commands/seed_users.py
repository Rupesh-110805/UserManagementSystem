"""
Management command to generate mock user data
Usage: python manage.py seed_users --count 50
"""
import requests
from django.core.management.base import BaseCommand
from apps.users.models import User
import random


class Command(BaseCommand):
    help = 'Generate mock user data from randomuser.me API'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=20, help='Number of users to create')
        parser.add_argument('--clear', action='store_true', help='Clear existing non-admin users before seeding')

    def handle(self, *args, **options):
        count = options['count']
        clear = options['clear']

        if clear:
            deleted_count = User.objects.filter(role='USER').delete()[0]
            self.stdout.write(self.style.WARNING(f'Deleted {deleted_count} existing users'))

        self.stdout.write(self.style.HTTP_INFO(f'Fetching {count} mock users from randomuser.me...'))

        try:
            response = requests.get(
                f'https://randomuser.me/api/?results={count}&nat=us,gb,au,ca,in',
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            users_data = data['results']

            created_count = 0
            skipped_count = 0

            for user_data in users_data:
                email = user_data['email']
                
                if User.objects.filter(email=email).exists():
                    self.stdout.write(self.style.WARNING(f'Skipped: {email} (already exists)'))
                    skipped_count += 1
                    continue

                full_name = f"{user_data['name']['first']} {user_data['name']['last']}"
                role = 'ADMIN' if random.random() < 0.1 else 'USER'
                status = 'ACTIVE' if random.random() < 0.8 else 'INACTIVE'

                user = User.objects.create_user(
                    email=email,
                    full_name=full_name,
                    password='Password123!@#',
                    role=role,
                    status=status
                )

                status_color = self.style.SUCCESS if status == 'ACTIVE' else self.style.ERROR
                role_color = self.style.WARNING if role == 'ADMIN' else self.style.HTTP_INFO
                
                self.stdout.write(f'Created: {email} | {role_color(role)} | {status_color(status)} | {full_name}')
                created_count += 1

            self.stdout.write(self.style.SUCCESS(f'\n Successfully created {created_count} users'))
            if skipped_count > 0:
                self.stdout.write(self.style.WARNING(f' Skipped {skipped_count} duplicate users'))
            
            self.print_statistics()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            self.stdout.write(self.style.WARNING('Falling back to local generation...'))
            self.generate_local_users(count)

    def generate_local_users(self, count):
        first_names = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 
                       'Robert', 'Olivia', 'Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Kavya']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Patel', 
                     'Kumar', 'Singh', 'Sharma', 'Chen', 'Li', 'Wong']
        domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com']

        created_count = 0
        for i in range(count):
            first = random.choice(first_names)
            last = random.choice(last_names)
            domain = random.choice(domains)
            email = f"{first.lower()}.{last.lower()}{random.randint(1, 999)}@{domain}"
            
            if User.objects.filter(email=email).exists():
                continue

            full_name = f"{first} {last}"
            role = 'ADMIN' if random.random() < 0.1 else 'USER'
            status = 'ACTIVE' if random.random() < 0.8 else 'INACTIVE'

            User.objects.create_user(
                email=email,
                full_name=full_name,
                password='Password123!@#',
                role=role,
                status=status
            )
            
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'\n Successfully created {created_count} users locally'))
        self.print_statistics()

    def print_statistics(self):
        total_users = User.objects.count()
        active_users = User.objects.filter(status='ACTIVE').count()
        inactive_users = User.objects.filter(status='INACTIVE').count()
        admins = User.objects.filter(role='ADMIN').count()
        regular_users = User.objects.filter(role='USER').count()

        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.HTTP_INFO('DATABASE STATISTICS'))
        self.stdout.write('='*60)
        self.stdout.write(f'Total Users:     {total_users}')
        self.stdout.write(f'Active Users:    {active_users} ({active_users/total_users*100:.1f}%)')
        self.stdout.write(f'Inactive Users:  {inactive_users} ({inactive_users/total_users*100:.1f}%)')
        self.stdout.write(f'Admins:          {admins}')
        self.stdout.write(f'Regular Users:   {regular_users}')
        self.stdout.write('='*60)
        self.stdout.write(self.style.WARNING('\nDefault password: Password123!@#'))
        self.stdout.write('='*60 + '\n')
