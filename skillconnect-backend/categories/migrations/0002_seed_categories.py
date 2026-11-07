from django.db import migrations


CATEGORIES = [
    ('electrician', 'Electrician', 'Electrical installation, repair and maintenance.', '₹500-₹900/hr', ['Wiring', 'Switch Repair', 'MCB/Fuse', 'Fan Repair']),
    ('plumber', 'Plumber', 'Pipes, taps, leaks, bathrooms and water systems.', '₹400-₹800/hr', ['Leak Repair', 'Tap Repair', 'Pipe Work', 'Bathroom Repair']),
    ('carpenter', 'Carpenter', 'Furniture, doors, cabinets and woodwork.', '₹500-₹1000/hr', ['Furniture Repair', 'Door Repair', 'Cabinet Work', 'Custom Woodwork']),
    ('painter', 'Painter', 'Interior and exterior painting services.', '₹400-₹800/hr', ['Wall Painting', 'Touch Up', 'Texture Work', 'Exterior Painting']),
    ('cleaner', 'Home Cleaner', 'Home and residential cleaning services.', '₹300-₹600/hr', ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Move-in Cleaning']),
    ('ac_technician', 'AC Technician', 'Air-conditioner installation, repair and maintenance.', '₹500-₹1000/hr', ['AC Service', 'Gas Refill', 'Installation', 'Repair']),
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    for slug, name, description, avg_price, services in CATEGORIES:
        Category.objects.update_or_create(
            category_id=slug,
            defaults={
                'category_name': name,
                'description': description,
                'avg_price': avg_price,
                'popular_services': services,
            },
        )


def remove_categories(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    Category.objects.filter(category_id__in=[c[0] for c in CATEGORIES]).delete()


class Migration(migrations.Migration):
    dependencies = [('categories', '0001_initial')]
    operations = [migrations.RunPython(seed_categories, remove_categories)]
