from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_book_sentiment'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserBook',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('bookmarked', 'Bookmarked'), ('reading', 'Reading'), ('finished', 'Finished')], max_length=20)),
                ('notes', models.TextField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_statuses', to='api.book')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_books', to='auth.user')),
            ],
            options={
                'unique_together': {('user', 'book')},
            },
        ),
    ]
