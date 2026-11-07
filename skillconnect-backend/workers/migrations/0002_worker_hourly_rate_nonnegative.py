from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('workers', '0001_initial')]
    operations = [
        migrations.AlterField(
            model_name='worker',
            name='hourly_rate',
            field=models.DecimalField(
                decimal_places=2,
                default=30.0,
                max_digits=8,
                validators=[MinValueValidator(Decimal('0'))],
            ),
        ),
    ]
