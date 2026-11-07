from django.db import migrations, models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Migration(migrations.Migration):
    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='estimate_amount',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                validators=[MinValueValidator(Decimal('0'))],
            ),
        ),
        migrations.AlterField(
            model_name='booking',
            name='booking_status',
            field=models.CharField(
                choices=[
                    ('Pending', 'Pending'),
                    ('Accepted', 'Accepted'),
                    ('Rejected', 'Rejected'),
                    ('Estimate Submitted', 'Estimate Submitted'),
                    ('Estimate Rejected', 'Estimate Rejected'),
                    ('Estimate Approved', 'Estimate Approved'),
                    ('Completed', 'Completed'),
                    ('Cancelled', 'Cancelled'),
                ],
                default='Pending',
                max_length=30,
            ),
        ),
    ]
