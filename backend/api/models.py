from datetime import datetime, timezone

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    C'est un model pour créer une classe customizé du "user" par défaut
    de Django.
    """

    def create_user(self, pseudo, password, **extra_fields):
        """
        Créer et enregistrer un utilisateur avec un pseudo et un mot de passe.
        """
        user = self.model(pseudo=pseudo, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, pseudo, password, **extra_fields):
        """
        Créer et enregistrer un Super utilisateur avec un pseudo et un mot de passe.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(pseudo, password, **extra_fields)


# Models Banxaas.
class User(AbstractBaseUser, PermissionsMixin):

    # Enum Variable
    CURRENCY_VALUE = [("XOF", "XOF"), ("USD", "USD"), ("EUR", "EUR")]

    # Personnal Info
    pseudo = models.CharField(max_length=30, unique=True)
    email = models.EmailField(_('email address'), unique=True, blank=True, null=True)
    phone = models.CharField(max_length=14, unique=True, blank=True, null=True)

    # Others Info
    isAuthenticated = models.BooleanField(default=False)  # readOnly
    is_staff = models.BooleanField(default=False)  # readOnly
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    currency = models.CharField(max_length=50, default="CFA", choices=CURRENCY_VALUE)

    # Config User
    USERNAME_FIELD = 'pseudo'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.pseudo

    def connect(self):
        self.isAuthenticated = True
        self.last_login = datetime.now(timezone.utc)

    def disconnect(self):
        self.isAuthenticated = False

    def get_seniority(self):
        seniority = datetime.now(timezone.utc) - self.date_joined
        seniority = seniority.total_seconds()
        if seniority < 60:
            seniority = "Moins d'une minute"
        elif 60 < seniority < 3600:
            seniority = str(int(seniority // 60)) + " minute(s)"
        elif 3600 < seniority < 86400:
            seniority = str(int(seniority // 3600)) + " heure(s)"
        return seniority

    def get_payment_methods(self):
        return [pm for pm in PaymentMethod.objects.filter(user=self)]


class PaymentMethod(models.Model):
    # Enum Payment Method
    PAYMENT_METHOD = [("WAVE", "Wave"), ("OM", "Orange Money"), ("FREE", "Free Money")]

    user = models.ForeignKey(User, related_name="pms", on_delete=models.CASCADE)
    name = models.CharField(max_length=15, choices=PAYMENT_METHOD)
    phone = models.IntegerField()

    def __str__(self):
        return str(self.name) + " | " + str(self.user)


class Ad(models.Model):
    # Enum Sens
    PAYMENT_METHOD = [("WAVE", "Wave"), ("OM", "Orange Money"), ("FREE", "Free Money")]
    SENS = [("A", "Achat"), ("V", "Vente")]
    TYPE = [("F", "FIXED"), ("R", "RANGE")]
    STATUS = [("F", "Finalisée"), ("A", "Annulé"), ("C", "En cours"), ("I", "Initial")]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=1, choices=STATUS, default="I")
    sens = models.CharField(max_length=1, choices=SENS)
    quantityType = models.CharField(max_length=50, choices=TYPE)
    quantityFixe = models.CharField(max_length=21, blank=True, null=True)
    quantityMin = models.CharField(max_length=21, blank=True, null=True)
    quantityMax = models.CharField(max_length=21, blank=True, null=True)
    amountType = models.CharField(max_length=50, choices=TYPE)
    amountFixe = models.CharField(max_length=21, blank=True, null=True)
    amountMin = models.CharField(max_length=21, blank=True, null=True)
    amountMax = models.CharField(max_length=21, blank=True, null=True)
    publicationDate = models.DateTimeField(auto_now_add=True)
    marge = models.IntegerField()
    provider = models.CharField(max_length=15, choices=PAYMENT_METHOD)

    def get_num_of_ads_available():
    	return int(Ad.objects.filter(status="I").count())


class Trade(models.Model):
    STATUS = [("F", "Finalisée"), ("A", "Annulé"), ("C", "En cours")]

    trader = models.ForeignKey(User, on_delete=models.CASCADE)
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE)
    startingDate = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=1, choices=STATUS, default="C")
    steps = models.CharField(max_length=2, choices=[(str(i), "step " + str(i)) for i in range(1, 14)])
